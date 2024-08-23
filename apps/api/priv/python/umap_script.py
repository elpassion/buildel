import psycopg2.extras
import umap
import psycopg2
import os
import datetime
import random
import json
import os.path
import pickle

database_url = os.environ.get('DATABASE_URL', "postgres://postgres:postgres@localhost:54321/buildel_dev")

conn = psycopg2.connect(database_url)

def save_reducer(cursor, collection_name, reducer):
    cursor.execute("DELETE FROM memories_graph_reducers WHERE graph_name = %s", (collection_name,))
    cursor.execute("INSERT INTO memories_graph_reducers (graph_name, reducer) VALUES(%s, %s)", (collection_name, pickle.dumps(reducer)))

def get_reducer(cursor, collection_name):
    cursor.execute("SELECT reducer FROM memories_graph_reducers WHERE graph_name = %s", (collection_name,))
    result = cursor.fetchone()
    if (result == None):
        return None
    else:
        return pickle.loads(result[0])

def memory_added_to_graph(cursor, memory_id):
    cursor.execute(
        """
            SELECT COUNT(*) 
            FROM memories_graph_points AS mgp
            JOIN vector_collection_chunks AS vcc ON mgp.id = vcc.id
            WHERE vcc.metadata @> %s
        """,
        (json.dumps({"memory_id": memory_id}),)
    )
    (count,) = cursor.fetchone()
    return count > 0


SAMPLE_SIZE = 1500

def reduce_dimensions(collection_name, memory_id):
    n_neighbors=15
    min_dist=0.75
    spread=3
    n_components=2
    print("Loading data...")
    collection_name = collection_name.decode('ascii')
    if (isinstance(memory_id, int)):
        None
    else:
        memory_id = None
    cursor = conn.cursor()
    reducer = get_reducer(cursor, collection_name)
    is_added = memory_id != None and memory_added_to_graph(cursor, memory_id)
    if (is_added):
        print("Already added")
        return "ok"
    is_adding = reducer != None and memory_id != None and reducer._raw_data.shape[0] >= SAMPLE_SIZE
    if (is_adding):
      cursor.execute(
        """
            SELECT COALESCE (embedding_3072::halfvec, embedding_1536::halfvec, embedding_384) as embedding, id 
            FROM vector_collection_chunks
            WHERE collection_name = %s AND metadata @> %s
        """, 
        (collection_name, json.dumps({"memory_id": memory_id})),
        ) 
    else:
         cursor.execute(
            """
                SELECT COALESCE (embedding_3072::halfvec, embedding_1536::halfvec, embedding_384) as embedding, id 
                FROM vector_collection_chunks 
                WHERE collection_name = %s
            """, 
            (collection_name,),
        )
    data = cursor.fetchall()
    random.shuffle(data)
    embeddings = [e[0][1:-1].split(",") for e in data]
    
    print("Starting UMAP reduction...")
    print(datetime.datetime.now())
    if (is_adding):
        print("Adding records")
        embeddings_res = reducer.transform(embeddings).tolist()
    else:
        print("Creating new graph")
        reducer = umap.UMAP(n_neighbors=n_neighbors, min_dist=min_dist, spread=spread, n_components=n_components, metric='euclidean')
        print(len(embeddings))
        if (len(embeddings) > SAMPLE_SIZE):
            teach_embeddings = embeddings[:SAMPLE_SIZE]
            rest_embeddings = embeddings[SAMPLE_SIZE:]
            teach_embeddings_res = reducer.fit_transform(teach_embeddings)
            rest_embeddings_res = reducer.transform(rest_embeddings)
            embeddings_res = teach_embeddings_res.tolist() + rest_embeddings_res.tolist()
        else:
            embeddings_res = reducer.fit_transform(embeddings).tolist()


    print("Dumping new reducers")
    save_reducer(cursor, collection_name, reducer)

    print("Deleting previous graph...")
    print(datetime.datetime.now())
    if (is_adding):
        ids = [e[1] for e in data]
        cursor.execute(
            """
                DELETE FROM memories_graph_points
                WHERE id IN %s
            """,
            (tuple(ids),)
        )
    else:
        cursor.execute(
            """
                DELETE FROM memories_graph_points
                WHERE graph_name = %s
            """,
            (collection_name,)
        )

    insert_data = [(data[index][1], collection_name, e) for index, e in enumerate(embeddings_res)]

    print("Inserting new graph...")

    psycopg2.extras.execute_values(
        cursor,
        'INSERT INTO memories_graph_points (id, graph_name, point) values %s',
        insert_data,
        page_size=100,
    )

    conn.commit()
    cursor.close()

    print("UMAP Saved to DB")
 
    return "ok"

