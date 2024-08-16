import psycopg2.extras
import umap
import psycopg2
import os

database_url = os.environ.get('DATABASE_URL', "postgres://postgres:postgres@localhost:54321/buildel_dev")

conn = psycopg2.connect(database_url)

def reduce_dimensions(collection_name):
    n_neighbors=15
    min_dist=0.75
    spread=3
    n_components=2
    print("Loading data...")
    collection_name = collection_name.decode('ascii')
    cursor = conn.cursor()
    cursor.execute(
        """
            SELECT COALESCE (embedding_3072, embedding_1536, embedding_384) as embedding, id 
            FROM vector_collection_chunks 
            WHERE collection_name = %s
        """, 
        (collection_name,),
    )
    data = cursor.fetchall()
    embeddings = [e[0][1:-1].split(",") for e in data]
    print("Starting UMAP reduction...")
    reducer = umap.UMAP(n_neighbors=n_neighbors, min_dist=min_dist, spread=spread, n_components=n_components, metric='euclidean')
    embedding = reducer.fit_transform(list(embeddings))
    
    print("Deleting previous graph...")
    cursor.execute(
        """
            DELETE FROM memories_graph_points
            WHERE graph_name = %s
        """,
        (collection_name,)
    )

    insert_data = [(data[index][1], collection_name, e) for index, e in enumerate(embedding.tolist())]

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

