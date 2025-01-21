// loading data into out database in a script
import { DataAPIClient } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "langchain/document_loaders/web/puppeteer";
import OpenAI from "openai";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"; //https://python.langchain.com/v0.1/docs/modules/data_connection/document_transformers/recursive_text_splitter/

import "dotenv/config";

const {
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKE,
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
