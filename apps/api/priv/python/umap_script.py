import umap
import numpy as np
import json

def reduce_dimensions(path):
    n_neighbors=15
    min_dist=0.75
    spread=3
    n_components=2
    # read file and parse json
    print("Loading data...")
    print(path)
    file = open(path)
    data = []
    with open(path, 'r') as file:
        for line in file:
            data_entry = json.loads(line)
            data.append(data_entry)
    print("Starting UMAP reduction...")
    reducer = umap.UMAP(n_neighbors=n_neighbors, min_dist=min_dist, spread=spread, n_components=n_components, metric='euclidean')
    embeddings = map(lambda x: x['embedding'], data)
    embedding = reducer.fit_transform(list(embeddings))
    print("UMAP reduction complete.")
 
    with open(path, "w") as outfile:
        changed_data = [{'embedding': e, 'id': data[index]['id']} for index, e in enumerate(embedding.tolist())]
        for row in changed_data:
            json.dump(row, outfile)
            outfile.write("\n")

    print("UMAP saved to file.")
    return "ok"

