import "dotenv/config";
import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone } from "@pinecone-database/pinecone";

async function ingestRepo(repoUrl?: string, token?: string) {
  const repositoryUrl =
    repoUrl ||
    process.env.GITHUB_REPO_URL ||
    "https://github.com/nancy-kataria/Digital_Lawyer";
  const githubToken = token || process.env.GITHUB_TOKEN;

  const loader = new GithubRepoLoader(repositoryUrl, {
    branch: "main",
    accessToken: githubToken,
    ignoreFiles: [
      "package-lock.json",
      ".env",
      "deno-lock.json",
      "yarn.lock",
      "composer.lock",
      "pnpm-lock.yaml",
      "Gemfile.lock",
      "poetry.lock",
      "uv.lock",
      // Images
      "*.png",
      "*.jpg",
      "*.jpeg",
      "*.gif",
      "*.svg",
      "*.ico",
      // Documents
      "*.pdf",
      "*.docx",
      // Fonts
      "*.woff",
      "*.woff2",
      "*.ttf",
      "*.eot",
      // Version control & editors
      ".git/**",
      ".vscode/**",
      ".idea/**",
      // Dependencies
      "node_modules/**",
      // Python cache
      "__pycache__/**",
      "*.pyc",
    ],
  });

  const docs = await loader.load();
  console.log(`Loaded ${docs.length} documents`);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await splitter.splitDocuments(docs);
  console.log(`Split into ${chunks.length} chunks`);

  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
  const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

  const embeddings = new OpenAIEmbeddings({
    modelName: "text-embedding-3-small",
  });

  console.log("Generating embeddings for chunks...");
  const embeddingsList = await embeddings.embedDocuments(
    chunks.map((chunk) => chunk.pageContent),
  );
  console.log(`Generated ${embeddingsList.length} embeddings`);

  // Creating vectors in the new Pinecone v1.0+ API format
  const vectors = chunks.map((chunk, idx) => ({
    id: `chunk-${Date.now()}-${idx}`,
    values: embeddingsList[idx],
    metadata: {
      source: chunk.metadata.source || "unknown",
    },
  }));

  console.log(`Upserting ${vectors.length} vectors to Pinecone...`);

  // Upserting in batches using the new API format
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(vectors.length / batchSize);
    console.log(
      `Upserting batch ${batchNum} of ${totalBatches}... (${batch.length} vectors)`,
    );
    await index.upsert({ records: batch });
  }

  console.log("Ingestion complete!");
}

ingestRepo(process.argv[2], process.argv[3]).catch(console.error);
