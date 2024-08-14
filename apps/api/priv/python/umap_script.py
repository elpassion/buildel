import umap
import numpy as np
import json


def reduce_dimensions(path):
    n_neighbors=15
    min_dist=0.5
    n_components=2
    # read file and parse json
    print("Loading data...")
    print(path)
    file = open(path)
    data = json.load(file)
    print("Starting UMAP reduction...")
    reducer = umap.UMAP(n_neighbors=n_neighbors, min_dist=min_dist, n_components=n_components, metric='euclidean')
    embedding = reducer.fit_transform(data)
    print("UMAP reduction complete.")
 
    with open(path, "w") as outfile:
        json.dump(embedding.tolist(), outfile)

    print("UMAP saved to file.")
    return "ok"

