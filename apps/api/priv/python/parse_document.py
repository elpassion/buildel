from json import dumps
from unstructured.partition.auto import partition
from unstructured.staging.base import elements_to_json
from unstructured.chunking.title import chunk_by_title

def partition_file(filename):
  if isinstance(filename, bytes):
    filename = filename.decode("utf-8")

  try:
    elements = partition(filename=filename, encoding="utf_8", chunking_strategy="by_title")
  except:
    elements = partition(filename=filename, chunking_strategy="by_title")

  elements_json = elements_to_json(elements)

  return elements_json

def partition_url(url):
  if isinstance(url, bytes):
    url = url.decode("utf-8")

  try:
    elements = partition(url=url, encoding="utf_8", chunking_strategy="by_title")
  except:
    elements = partition(url=url, chunking_strategy="by_title")
  elements_json = elements_to_json(elements)

  return elements_json

if __name__ == '__main__':
  import sys
  filename = sys.argv[1]
  elements_json = partition_file(filename)
  print(elements_json)