from langchain.text_splitter import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size = 1500,
    chunk_overlap  = 500,
    length_function = len,
    is_separator_regex = False,
)

with open('/home/michal/Rozpoczęcie pracy.txt') as f:
    state_of_the_union = f.read()

texts = text_splitter.create_documents([state_of_the_union])

for text in texts:
    print(text)
    print("\n\n" + "-"*80)