from json import dumps
from unstructured.partition.auto import partition
from unstructured.staging.base import elements_to_json
from unstructured.chunking.title import chunk_by_title

def partition_file(filename):
  if isinstance(filename, bytes):
    filename = filename.decode("utf-8")

  elements = partition(filename=filename, encoding="utf_8")
  chunks = chunk_by_title(elements)

  for chunk in chunks:
    print(chunk)
    print("\n\n" + "-"*80)

  return []

if __name__ == '__main__':
  print(partition_file("/home/michal/Rozpoczęcie pracy.txt"))