import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NameContent } from './name-content.entity';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import * as fs from 'fs';
import pdf from 'pdf-parse';
import path from 'path';

@Injectable()
export class NamesService {
  private pinecone: Pinecone;
  private openai: OpenAI;
  private readonly names = [
    { arabic: 'الله', transliteration: 'Allah' },
    { arabic: 'الرَّحْمٰن', transliteration: 'Ar-Rahman' },
    { arabic: 'الرَّحِيم', transliteration: 'Ar-Rahim' },
    { arabic: 'الْمَلِك', transliteration: 'Al-Malik' },
    { arabic: 'الْقُدُّوس', transliteration: 'Al-Quddus' },
    { arabic: 'السَّلاَم', transliteration: 'As-Salam' },
    { arabic: 'المُؤْمِن', transliteration: "Al-Mu'min" },
    { arabic: 'الْمُهَيْمِن', transliteration: 'Al-Muhaymin' },
    { arabic: 'الْعَزِيز', transliteration: 'Al-Aziz' },
    { arabic: 'الْجَبَّار', transliteration: 'Al-Jabbar' },
    { arabic: 'الْمُتَكَبِّر', transliteration: 'Al-Mutakabbir' },
    { arabic: 'الْخَالِق', transliteration: 'Al-Khaliq' },
    { arabic: 'الْبَارِئ', transliteration: 'Al-Bari' },
    { arabic: 'الْمُصَوِّر', transliteration: 'Al-Musawwir' },
    { arabic: 'الْغَفَّار', transliteration: 'Al-Ghaffar' },
    { arabic: 'الْقَهَّار', transliteration: 'Al-Qahhar' },
    { arabic: 'الْوَهَّاب', transliteration: 'Al-Wahhab' },
    { arabic: 'الرَّزَّاق', transliteration: 'Ar-Razzaq' },
    { arabic: 'الْفَتَّاح', transliteration: 'Al-Fattah' },
    { arabic: 'الْعَلِيم', transliteration: 'Al-Alim' },
    { arabic: 'الْقَابِض', transliteration: 'Al-Qabid' },
    { arabic: 'الْبَاسِط', transliteration: 'Al-Basit' },
    { arabic: 'الْخَافِض', transliteration: 'Al-Khafid' },
    { arabic: 'الرَّافِع', transliteration: "Ar-Rafi'" },
    { arabic: 'الْمُعِزّ', transliteration: "Al-Mu'izz" },
    { arabic: 'المُذِلّ', transliteration: 'Al-Mudhill' },
    { arabic: 'السَّمِيع', transliteration: "As-Sami'" },
    { arabic: 'الْبَصِير', transliteration: 'Al-Basir' },
    { arabic: 'الْحَكَم', transliteration: 'Al-Hakam' },
    { arabic: 'الْعَدْل', transliteration: 'Al-Adl' },
    { arabic: 'اللَّطِيف', transliteration: 'Al-Latif' },
    { arabic: 'الْخَبِير', transliteration: 'Al-Khabir' },
    { arabic: 'الْحَلِيم', transliteration: 'Al-Halim' },
    { arabic: 'الْعَظِيم', transliteration: 'Al-Azim' },
    { arabic: 'الْغَفُور', transliteration: 'Al-Ghafur' },
    { arabic: 'الشَّكُور', transliteration: 'Ash-Shakur' },
    { arabic: 'الْعَلِيّ', transliteration: 'Al-Ali' },
    { arabic: 'الْكَبِير', transliteration: 'Al-Kabir' },
    { arabic: 'الْحَفِيظ', transliteration: 'Al-Hafiz' },
    { arabic: 'الْمُقِيت', transliteration: 'Al-Muqit' },
    { arabic: 'الْحسِيب', transliteration: 'Al-Hasib' },
    { arabic: 'الْجَلِيل', transliteration: 'Al-Jalil' },
    { arabic: 'الْكَرِيم', transliteration: 'Al-Karim' },
    { arabic: 'الرَّقِيب', transliteration: 'Ar-Raqib' },
    { arabic: 'الْمُجِيب', transliteration: 'Al-Mujib' },
    { arabic: 'الْوَاسِع', transliteration: "Al-Wasi'" },
    { arabic: 'الْحَكِيم', transliteration: 'Al-Hakim' },
    { arabic: 'الْوَدُود', transliteration: 'Al-Wadud' },
    { arabic: 'الْمَجِيد', transliteration: 'Al-Majid' },
    { arabic: 'الْبَاعِث', transliteration: "Al-Ba'ith" },
    { arabic: 'الشَّهِيد', transliteration: 'Ash-Shahid' },
    { arabic: 'الْحَقّ', transliteration: 'Al-Haqq' },
    { arabic: 'الْوَكِيل', transliteration: 'Al-Wakil' },
    { arabic: 'الْقَوِيّ', transliteration: 'Al-Qawiyy' },
    { arabic: 'الْمَتِين', transliteration: 'Al-Matin' },
    { arabic: 'الْوَلِيّ', transliteration: 'Al-Wali' },
    { arabic: 'الْحَمِيد', transliteration: 'Al-Hamid' },
    { arabic: 'الْمُحْصِي', transliteration: 'Al-Muhsi' },
    { arabic: 'الْمُبْدِئ', transliteration: 'Al-Mubdi' },
    { arabic: 'الْمُعِيد', transliteration: "Al-Mu'id" },
    { arabic: 'الْمُحْيِي', transliteration: 'Al-Muhyi' },
    { arabic: 'اَلْمُمِيت', transliteration: 'Al-Mumit' },
    { arabic: 'الْحَيّ', transliteration: 'Al-Hayy' },
    { arabic: 'الْقَيُّوم', transliteration: 'Al-Qayyum' },
    { arabic: 'الْوَاجِد', transliteration: 'Al-Wajid' },
    { arabic: 'الْمَاجِد', transliteration: 'Al-Majid' },
    { arabic: 'الْواحِد', transliteration: 'Al-Wahid' },
    { arabic: 'اَلاَحَد', transliteration: 'Al-Ahad' },
    { arabic: 'الصَّمَد', transliteration: 'As-Samad' },
    { arabic: 'الْقَادِر', transliteration: 'Al-Qadir' },
    { arabic: 'الْمُقْتَدِر', transliteration: 'Al-Muqtadir' },
    { arabic: 'الْمُقَدِّم', transliteration: 'Al-Muqaddim' },
    { arabic: 'الْمُؤَخِّر', transliteration: "Al-Mu'akhkhir" },
    { arabic: 'الأوَّل', transliteration: 'Al-Awwal' },
    { arabic: 'الآخِر', transliteration: 'Al-Akhir' },
    { arabic: 'الظَّاهِر', transliteration: 'Az-Zahir' },
    { arabic: 'الْبَاطِن', transliteration: 'Al-Batin' },
    { arabic: 'الْوالي', transliteration: 'Al-Wali' },
    { arabic: 'المُتَعالِي', transliteration: "Al-Muta'ali" },
    { arabic: 'الْبَرّ', transliteration: 'Al-Barr' },
    { arabic: 'التَّوَّاب', transliteration: 'At-Tawwab' },
    { arabic: 'الْمُنْتَقِم', transliteration: 'Al-Muntaqim' },
    { arabic: 'العَفُو', transliteration: "Al-'Afuww" },
    { arabic: 'الرَّؤُوف', transliteration: "Ar-Ra'uf" },
    { arabic: 'مَالِك ٱلْمُلْك', transliteration: 'Malik al-Mulk' },
    {
      arabic: 'ذُوالْجَلَالِ وَالإكْرَامِ',
      transliteration: 'Dhul-Jalal wa-l-Ikram',
    },
    { arabic: 'الْمُقْسِط', transliteration: 'Al-Muqsit' },
    { arabic: 'الْجَامِع', transliteration: "Al-Jami'" },
    { arabic: 'ٱلْغَني', transliteration: 'Al-Ghani' },
    { arabic: 'ٱلْمُغْني', transliteration: 'Al-Mughni' },
    { arabic: 'اَلْمَانِع', transliteration: 'Al-Mani' },
    { arabic: 'الضَّار', transliteration: 'Ad-Darr' },
    { arabic: 'النَّافِع', transliteration: 'An-Nafi' },
    { arabic: 'ٱلنُّور', transliteration: 'An-Nur' },
    { arabic: 'الْهَادِي', transliteration: 'Al-Hadi' },
    { arabic: 'ٱلْبَدِيع', transliteration: 'Al-Badi' },
    { arabic: 'اَلْبَاقِي', transliteration: 'Al-Baqi' },
    { arabic: 'ٱلْوَارِث', transliteration: 'Al-Warith' },
    { arabic: 'ٱلرَّشِيد', transliteration: 'Ar-Rashid' },
    { arabic: 'ٱلصَّبُور', transliteration: 'As-Sabur' },
  ];

  constructor(
    @InjectRepository(NameContent)
    private nameContentRepository: Repository<NameContent>,
  ) {
    void this.initPinecone();
    void this.initOpenAI();
  }

  private initPinecone() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY as string,
    });
  }

  private initOpenAI() {
    this.openai = new OpenAI({
      apiKey: process.env['OPENAI_API_KEY'],
    });
  }

  private async generateContent(name: {
    arabic: string;
    transliteration: string;
  }): Promise<Record<string, any>> {
    const sources = await this.getSources(name.transliteration);
    const prompt = this.createPrompt(name, sources);
    const content = await this.generateWithAI(prompt);
    const contentJson = JSON.parse(content); // Parse the JSON response

    // Extract key fields
    const { translation } = contentJson.name;
    const detailedContent = { ...contentJson };
    delete detailedContent.name; // Remove key fields from detailed content

    // await this.saveContentToDB(name, translation, detailedContent);
    return contentJson;
  }

  private async saveContentToDB(
    name: { arabic: string; transliteration: string },
    translation: string,
    detailedContent: Record<string, any>,
  ) {
    const nameContent = this.nameContentRepository.create({
      arabic: name.arabic,
      transliteration: name.transliteration,
      translation,
      detailedContent,
    });
    await this.nameContentRepository.save(nameContent);
  }

  private async getSources(name: string): Promise<string[]> {
    const index = this.pinecone.Index('allah-names');
    const queryEmbedding = await this.getEmbedding(name);
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: 10,
      includeMetadata: true,
    });

    return queryResponse.matches
      .map((match) => match.metadata?.text as string)
      .filter((text) => text !== undefined);
  }

  private async getEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    });

    return response.data[0].embedding;
  }

  private createPrompt(
    name: {
      arabic: string;
      transliteration: string;
    },
    sources: string[],
  ): string {
    return `Generate a comprehensive explanation of the Name of Allah: "${name.transliteration}" (${name.arabic}"). Use the following sources for context and reference:

${sources.join('\n\n')}

Provide the response in the following JSON format:

{
  "name": {
    "arabic": "${name.arabic}", 
    "transliteration": "${name.transliteration}", 
    "translation": "[English translation of the name]"
  },
  "explanation": {
    "description": "[Detailed meaning of the name, including linguistic roots and nuances in Arabic]",
    "significance": "[Significance of the name in Islamic teachings]"
  },
  "quranicReferences": [
    {
      "verse": "[Verse citation, e.g., Surah 1:1]",
      "context": "[Brief explanation of how the verse relates to the name]"
    }
  ],
  "hadithReferences": [
    {
      "hadith": "[Hadith text related to the name]",
      "source": "[Hadith source, e.g., Sahih Bukhari]",
      "context": "[Explanation of how the hadith relates to the name]"
    }
  ],
  "reflections": {
    "application": "[Practical reflections on how a Muslim can embody this name in daily life]",
    "traits": "[Character traits or behaviors associated with this name]"
  },
  "duaAndDhikr": [
    {
      "text": "[Dua or dhikr text]",
      "translation": "[English translation of the dua or dhikr]"
    }
  ],
  "linguisticInsights": "[Unique linguistic aspects or root letters that contribute to understanding the name]"
}

Focus on authenticity and clarity, with well-organized and respectful content based on traditional Islamic sources.`;
  }

  private async generateWithAI(prompt: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a knowledgeable assistant with a deep understanding of Islamic theology, focusing on the 99 Names of Allah. Your task is to provide respectful, structured, and well-researched information for each Name. Draw upon Islamic sources such as the Quran, Hadith, Tafsir, and traditional books on the Names of Allah. The content should be factually accurate and deeply insightful, providing users with:
          
          1. A clear understanding of each Name’s meaning and its significance in Islam.
          2. Quranic and Hadith references, including brief context explaining how they relate to the Name.
          3. Practical reflections and applications on how Muslims can embody the attributes of the Name.
          4. Linguistic insights on the Arabic roots and any unique grammatical aspects of the Name.

          Present the information in a structured JSON format, ensuring it’s easy to parse, with each section clearly defined. Avoid speculative interpretations, focus on traditional explanations, and maintain a tone of reverence and clarity.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1000, // Increase as needed to ensure full JSON responses
      temperature: 0.7,
    });

    return response.choices[0].message.content as string;
  }

  private splitTextIntoChunks(text: string, chunkSize: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  private async storeInPinecone(embedding: number[], text: string) {
    const index = this.pinecone.Index('allah-names');
    // await index.upsert({
    //   vectors: [
    //     {
    //       id: `chunk-${Date.now()}`,
    //       values: embedding,
    //       metadata: { text },
    //     },
    //   ],
    // });
    await index.upsert([
      {
        id: `chunk-${Date.now()}`,
        values: embedding,
        metadata: { text },
      },
    ]);
  }

  private async createPCIndex() {
    const indexName = 'allah-names';

    await this.pinecone.createIndex({
      name: indexName,
      dimension: 1536,
      metric: 'cosine', // Replace with your model metric
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1',
        },
      },
    });
  }

  getNames(): Array<{ arabic: string; transliteration: string }> {
    return this.names;
  }

  async generateContentForAllNames(
    names: {
      arabic: string;
      transliteration: string;
    }[],
  ): Promise<Map<string, string>> {
    const contentMap = new Map<string, string>();

    for (const name of names) {
      const content = await this.generateContent(name);
      contentMap.set(name.transliteration, JSON.stringify(content));
    }

    return contentMap;
  }

  async processSourceMaterials() {
    // This is needed only the first time, to create Index in pinecone
    // await this.createPCIndex();

    // const quranText = fs.readFileSync('path/to/quran.txt', 'utf-8');
    // const tafsirText = fs.readFileSync('path/to/tafsir.txt', 'utf-8');
    // const hadithText = fs.readFileSync('path/to/hadith.txt', 'utf-8');
    // const pdfBuffer = fs.readFileSync('path/to/names_of_allah.pdf');

    const reflectionOnNamesBook = fs.readFileSync(
      path.join(__dirname, '../../pdfs/reflecting-on-the-names-of-allah.pdf'),
    );

    const reflectionOnNamesBookText = await pdf(reflectionOnNamesBook);

    // const allText =
    // quranText + '\n' + tafsirText + '\n' + hadithText + '\n' + pdfText.text;

    const allText = reflectionOnNamesBookText.text;
    const chunks = this.splitTextIntoChunks(allText, 1000);

    // const chunk = chunks[0];

    for (const chunk of chunks) {
      const embedding = await this.getEmbedding(chunk);
      await this.storeInPinecone(embedding, chunk);
    }

    console.log('Embedding completed');
  }
}
