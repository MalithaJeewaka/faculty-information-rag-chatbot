// loading data into out database in a script
import { DataAPIClient } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import OpenAI from "openai";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"; //https://python.langchain.com/v0.1/docs/modules/data_connection/document_transformers/recursive_text_splitter/

import "dotenv/config";

type SimilarityMetric = "dot_product" | "cosine" | "euclidean"; //refer datastax similarity metrics doc

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
  OPENAI_API_KEY,
} = process.env;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const ruhunaData = [
  "https://en.wikipedia.org/wiki/University_of_Ruhuna",
  "https://en.wikipedia.org/wiki/Faculties_and_institutions_of_University_of_Ruhuna",
  "https://www.eng.ruh.ac.lk/",
  "https://www.eng.ruh.ac.lk/about/",
  "https://www.eng.ruh.ac.lk/academic/",
  "https://www.eng.ruh.ac.lk/academic/departments/",
  "https://www.eng.ruh.ac.lk/dcee/",
  "https://www.eng.ruh.ac.lk/dcee/about/",
  "https://www.eng.ruh.ac.lk/dcee/staff/",
  "https://www.eng.ruh.ac.lk/dcee/news-and-events/",
  "https://www.eng.ruh.ac.lk/dcee/divisions/",
  "https://www.eng.ruh.ac.lk/dcee/wp-content/uploads/2023/03/DCEE-Hand-Book.pdf",
  "https://www.eng.ruh.ac.lk/dcee/aceps-2024/?preview=true#1657778961542-389c5103-a832",
  "https://www.eng.ruh.ac.lk/deie/",
  "https://www.eng.ruh.ac.lk/deie/about/",
  "https://www.eng.ruh.ac.lk/deie/academics/",
  "https://www.eng.ruh.ac.lk/deie/staff/",
  "https://www.eng.ruh.ac.lk/deie/news-and-events/",
  "https://www.eng.ruh.ac.lk/dmme/",
  "https://www.eng.ruh.ac.lk/dmme/about/",
  "https://www.eng.ruh.ac.lk/dmme/academics/",
  "https://www.eng.ruh.ac.lk/dmme/academics/mechanical-and-manufacturing-engineering/",
  "https://www.eng.ruh.ac.lk/dmme/academics/marine-engineering-and-naval-architecture/",
  "https://www.eng.ruh.ac.lk/dmme/staff/",
  "https://www.eng.ruh.ac.lk/dmme/news-and-events/",
  "https://www.eng.ruh.ac.lk/dmme/student-life/societies/",
  "https://www.eng.ruh.ac.lk/dmme/student-life/clubs/",
  "https://www.eng.ruh.ac.lk/dmme/student-life/student-support/",
  "https://www.eng.ruh.ac.lk/dmme/student-life/sports/",
  "https://www.eng.ruh.ac.lk/dis/",
  "https://www.eng.ruh.ac.lk/dis/about-us/",
  "https://www.eng.ruh.ac.lk/dis/academic/",
  "https://www.eng.ruh.ac.lk/dis/academic/undergraduate-programs/",
  "https://www.eng.ruh.ac.lk/dis/staff/",
  "https://www.eng.ruh.ac.lk/dis/news-and-events/",
  "https://www.eng.ruh.ac.lk/dis/student-life/student-support/",
  "https://www.eng.ruh.ac.lk/academic/undergraduate-programs/",
  "https://www.eng.ruh.ac.lk/academic/undergraduate-programs/computer-engineering/",
  "https://www.eng.ruh.ac.lk/academic/undergraduate-programs/electrical-information-engineering/",
  "https://www.eng.ruh.ac.lk/academic/undergraduate-programs/electrical-information-engineering/",
  "https://www.eng.ruh.ac.lk/dmme/academics/mechanical-and-manufacturing-engineering/",
  "https://www.eng.ruh.ac.lk/dmme/academics/marine-engineering-and-naval-architecture/",
  "https://www.eng.ruh.ac.lk/academic/centers-and-units/",
  "https://www.eng.ruh.ac.lk/news-and-events/",
  "https://www.eng.ruh.ac.lk/vacancies/",
];

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

const createCollection = async (
  similarityMetric: SimilarityMetric = "dot_product"
) => {
  const res = await db.createCollection(ASTRA_DB_COLLECTION, {
    vector: {
      dimension: 1536, //this should be whats in the openAi dimetions size according to related embedding. in this case text-embedding-ada-002
      metric: similarityMetric,
    },
  });
  console.log(res);
};

const loadSampleData = async () => {
  const collection = await db.collection(ASTRA_DB_COLLECTION);
  for await (const url of ruhunaData) {
    const content = await scrapePage(url);
    const chunks = await splitter.splitText(content);
    for await (const chunk of chunks) {
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk,
        encoding_format: "float",
      });

      const vector = embedding.data[0].embedding;

      const res = await collection.insertOne({
        $vector: vector,
        text: chunk,
      });
      console.log(res);
    }
  }
};

const scrapePage = async (url: string) => {
  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: {
      headless: true,
    },
    gotoOptions: {
      waitUntil: "domcontentloaded",
    },
    evaluate: async (page, browser) => {
      const result = await page.evaluate(() => document.body.innerHTML);
      await browser.close();
      return result;
    },
  });
  return (await loader.scrape())?.replace(/<[^>]*>?/gm, "");
};

// createCollection().then(() =>);
loadSampleData();
