import chromadb

print("正在讀取資料庫...")
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_collection("corporate_knowledge_base")

# 隨便抽查 1 筆資料的標籤
data = collection.get(limit=1)
print("\n🔍 資料庫內的一筆 Metadata 標籤長這樣：")
print(data['metadatas'][0])