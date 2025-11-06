// FIX: Removed GenerateContentRequest as it is not an exported member. The type will be inferred.
import { GoogleGenAI, Type } from "@google/genai";
import { Subject, StudyGuide, UploadedFile, Quiz, VocabularyQuestion } from '../types';

const vocabularyQuizItemsSchema = {
    type: Type.ARRAY,
    description: "A list of 7 multiple-choice vocabulary questions based on key terms in the material.",
    items: {
        type: Type.OBJECT,
        properties: {
            word: { type: Type.STRING, description: "The vocabulary word from the text." },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 4 definitions, one of which is correct. Definitions should be in Korean." },
            answer: { type: Type.STRING, description: "The correct definition for the word." }
        },
        required: ['word', 'options', 'answer']
    }
};

const studyGuideSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: "A concise summary of the key concepts from the provided material." },
        studyPlan: {
            type: Type.ARRAY,
            description: "A 10-day study plan to master the material.",
            items: {
                type: Type.OBJECT,
                properties: {
                    day: { type: Type.INTEGER },
                    goal: { type: Type.STRING, description: "The main learning objective for the day." },
                    tasks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific tasks for the day." }
                },
                required: ['day', 'goal', 'tasks']
            }
        },
        multipleChoiceQuestions: {
            type: Type.ARRAY,
            description: "A list of multiple-choice questions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    context: { type: Type.STRING, description: "An optional short passage from the source material that is relevant to this question. Only include this if the question directly refers to a specific part of the text." },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    answer: { type: Type.STRING },
                    examProbability: { type: Type.STRING, description: "Estimated probability of appearing on an exam. Must be 'High', 'Medium', or 'Low'." },
                    chainOfThoughtExplanation: {
                        type: Type.OBJECT,
                        properties: {
                            step1: { type: Type.STRING, description: "Analyze & Identify: What is the question asking and what concepts are needed?" },
                            step2: { type: Type.STRING, description: "Step-by-Step Solution: A detailed walkthrough to the correct answer." },
                            step3: { type: Type.STRING, description: "Review & Apply: Summarize the key principle and its applications." }
                        },
                        required: ['step1', 'step2', 'step3']
                    }
                },
                required: ['question', 'options', 'answer', 'examProbability', 'chainOfThoughtExplanation']
            }
        },
        shortAnswerQuestions: {
            type: Type.ARRAY,
            description: "A list of short-answer or essay questions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    context: { type: Type.STRING, description: "An optional short passage from the source material that is relevant to this question. Only include this if the question directly refers to a specific part of the text." },
                    answer: { type: Type.STRING },
                    examProbability: { type: Type.STRING, description: "Estimated probability of appearing on an exam. Must be 'High', 'Medium', or 'Low'." },
                    chainOfThoughtExplanation: {
                        type: Type.OBJECT,
                        properties: {
                            step1: { type: Type.STRING, description: "Analyze & Identify: What is the question asking and what concepts are needed?" },
                            step2: { type: Type.STRING, description: "Step-by-Step Solution: A detailed walkthrough to the correct answer." },
                            step3: { type: Type.STRING, description: "Review & Apply: Summarize the key principle and its applications." }
                        },
                        required: ['step1', 'step2', 'step3']
                    }
                },
                required: ['question', 'answer', 'examProbability', 'chainOfThoughtExplanation']
            }
        },
        vocabularyQuestions: vocabularyQuizItemsSchema
    },
    required: ['summary', 'studyPlan', 'multipleChoiceQuestions', 'shortAnswerQuestions', 'vocabularyQuestions']
};

const quizSchema = {
    type: Type.OBJECT,
    properties: {
        multipleChoiceQuestions: studyGuideSchema.properties.multipleChoiceQuestions,
        shortAnswerQuestions: studyGuideSchema.properties.shortAnswerQuestions
    },
    required: ['multipleChoiceQuestions', 'shortAnswerQuestions']
};

const vocabularyQuizSchema = {
    type: Type.OBJECT,
    properties: {
        vocabularyQuestions: vocabularyQuizItemsSchema
    },
    required: ['vocabularyQuestions']
};


const generatePrompt = (subject: Subject, fileCount: number, prioritizeExamQuestions: boolean): string => {
  const materialSource = fileCount > 0
    ? `the provided ${fileCount} file(s) (which could be PDFs, images of textbook pages, etc.)`
    : "the provided text content";

  const quizInstruction = prioritizeExamQuestions
    ? "For the quiz questions, you MUST prioritize generating questions that have a high probability of appearing on a real school exam. For EACH question, you must provide its estimated `examProbability` ('High', 'Medium', or 'Low'). The list of questions should be sorted with 'High' probability questions first."
    : "For the quiz questions, generate a diverse set covering the entire breadth of the provided material. For EACH question, you must provide its estimated `examProbability` ('High', 'Medium', or 'Low').";


  return `
You are an expert AI tutor named Study-GPT, specializing in helping Korean high school students advance from a 2-3 grade level to a 1. Your task is to analyze ${materialSource} for a specific subject and generate a comprehensive, personalized study guide.

The user is a first-year high school student. All explanations must be clear, encouraging, and easy to understand.

Subject: ${subject}

Based on the provided material, generate a JSON object that adheres to the specified schema.

**Subject-Specific Instructions:**
- If the subject is **Math**: Focus on creating a large number of practice problems for the concepts presented. The summary should highlight key formulas and problem-solving strategies. The 10-day plan should emphasize daily problem-solving practice.
- If the subject is **English**: Focus on vocabulary, grammar, sentence structure, and reading comprehension. Generate questions related to finding the main idea, inference, sentence insertion, and ordering. The summary should list key vocabulary and grammatical points.
- If the subject is **Korean**: For literature, focus on themes, characters, and literary devices. For non-fiction, focus on the main argument, structure, and evidence. For grammar, explain the rules and provide examples from the text.

**Quiz Generation Instructions:**
${quizInstruction}

**Output Generation Rules:**
1.  **Summary:** Create a concise summary of the key concepts from the material.
2.  **10-Day Plan:** Design a balanced 10-day study plan to master the material. Each day should have a clear goal.
3.  **Questions:** Generate at least 3 multiple-choice and 2 short-answer questions based on the quiz instructions above. For EACH question, if it refers to a specific part of the source material (like a text passage or a specific problem statement), you MUST include that relevant text in the 'context' field. If the question is general, omit the 'context' field.
4.  **Chain-of-Thought Explanations:** For EVERY question, provide a detailed 3-step Chain-of-Thought explanation.
    - **Step 1 (Analyze & Identify):** Clearly state what the question is asking and which core concepts are needed to solve it. Use Korean for explanations.
    - **Step 2 (Step-by-Step Solution):** Provide a logical, step-by-step walkthrough to the correct answer. Use Korean for explanations.
    - **Step 3 (Review & Apply):** Summarize the main takeaway or principle learned from the problem and suggest how to apply it to similar problems. Use Korean for explanations.
5.  **Vocabulary Quiz:** Extract 7 key vocabulary words from the material. For each word, create a multiple-choice question where the question is the word and the options are four definitions. The definitions should be in Korean. Provide one correct definition and three plausible incorrect ones.
`;
};

const generateQuizPrompt = (subject: Subject, prioritizeExamQuestions: boolean): string => {
  const quizInstruction = prioritizeExamQuestions
    ? "You MUST prioritize generating questions that have a high probability of appearing on a real school exam. For EACH question, you must provide its estimated `examProbability` ('High', 'Medium', or 'Low'). The list of questions should be sorted with 'High' probability questions first."
    : "Generate a diverse set covering the entire breadth of the provided material. For EACH question, you must provide its estimated `examProbability` ('High', 'Medium', or 'Low').";

  return `
You are an expert AI tutor, Study-GPT. Your task is to generate a new set of practice questions based on the provided study material for a high school student.

Subject: ${subject}

Based on the provided material, generate a new JSON object containing only practice questions that adheres to the specified schema.

**Quiz Generation Instructions:**
${quizInstruction}

**Output Generation Rules:**
1.  Generate at least 3 new multiple-choice and 2 new short-answer questions.
2.  For EACH question, if it refers to a specific part of the source material (like a text passage), you MUST include that relevant text in the 'context' field.
3.  For EVERY question, provide a detailed 3-step Chain-of-Thought explanation in Korean.
`;
};

const generateVocabularyQuizPrompt = (subject: Subject): string => {
    return `
You are an AI assistant. Based on the provided study material for the subject "${subject}", extract 7 new key vocabulary words. For each word, create one multiple-choice question. The question should be the word itself, and the options should be four definitions in Korean, with only one being correct. Provide the output in JSON format.
`;
};

// FIX: Adhere to guideline to only use process.env.API_KEY.
export const getAiClient = () => {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        throw new Error("Configuration Error: The Gemini API key is not configured. Please ensure the API_KEY environment variable is available.");
    }
    return new GoogleGenAI({ apiKey });
};


export const generateStudyGuide = async (subject: Subject, content: { text?: string; files?: UploadedFile[] }, prioritizeExamQuestions: boolean): Promise<StudyGuide> => {
    const ai = getAiClient();
    
    const prompt = generatePrompt(subject, content.files?.length || 0, prioritizeExamQuestions);
    
    // FIX: Refactored content parts construction for clarity.
    const parts: any[] = [];

    if (content.files && content.files.length > 0) {
        parts.push({ text: prompt });
        for (const file of content.files) {
             parts.push({
                inlineData: {
                    mimeType: file.mimeType,
                    data: file.data,
                },
            });
        }
    } else if (content.text) {
        const fullPrompt = prompt + `
Material Content:
---
${content.text}
---
`;
        parts.push({ text: fullPrompt });
    } else {
        throw new Error("No content provided to generate study guide.");
    }
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        // FIX: Corrected structure of contents parameter. It should be a Content object, not an array of them.
        contents: { parts },
        config: {
            responseMimeType: "application/json",
            responseSchema: studyGuideSchema,
        },
    });

    const jsonString = response.text;
    try {
        const parsedJson = JSON.parse(jsonString);
        return parsedJson as StudyGuide;
    } catch (e) {
        console.error("Failed to parse JSON response:", jsonString);
        throw new Error("The AI returned an invalid format. Please try again.");
    }
};

export const regenerateQuiz = async (subject: Subject, content: { text?: string; files?: UploadedFile[] }, prioritizeExamQuestions: boolean): Promise<Quiz> => {
    const ai = getAiClient();
    
    const prompt = generateQuizPrompt(subject, prioritizeExamQuestions);
    
    // FIX: Refactored content parts construction for clarity.
    const parts: any[] = [];

    if (content.files && content.files.length > 0) {
        parts.push({ text: prompt });
        for (const file of content.files) {
             parts.push({
                inlineData: {
                    mimeType: file.mimeType,
                    data: file.data,
                },
            });
        }
    } else if (content.text) {
        const fullPrompt = prompt + `
Material Content:
---
${content.text}
---
`;
        parts.push({ text: fullPrompt });
    } else {
        throw new Error("No content provided to regenerate quiz.");
    }
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        // FIX: Corrected structure of contents parameter. It should be a Content object, not an array of them.
        contents: { parts },
        config: {
            responseMimeType: "application/json",
            responseSchema: quizSchema,
        },
    });

    const jsonString = response.text;
    try {
        const parsedJson = JSON.parse(jsonString);
        return parsedJson as Quiz;
    } catch (e) {
        console.error("Failed to parse JSON response for quiz regeneration:", jsonString);
        throw new Error("The AI returned an invalid format for the new quiz. Please try again.");
    }
};

export const regenerateVocabularyQuiz = async (subject: Subject, content: { text?: string; files?: UploadedFile[] }): Promise<{ vocabularyQuestions: VocabularyQuestion[] }> => {
    const ai = getAiClient();
    
    const prompt = generateVocabularyQuizPrompt(subject);
    
    // FIX: Refactored content parts construction for clarity.
    const parts: any[] = [];

    if (content.files && content.files.length > 0) {
        parts.push({ text: prompt });
        for (const file of content.files) {
             parts.push({
                inlineData: {
                    mimeType: file.mimeType,
                    data: file.data,
                },
            });
        }
    } else if (content.text) {
        const fullPrompt = prompt + `
Material Content:
---
${content.text}
---
`;
        parts.push({ text: fullPrompt });
    } else {
        throw new Error("No content provided to regenerate vocabulary quiz.");
    }
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        // FIX: Corrected structure of contents parameter. It should be a Content object, not an array of them.
        contents: { parts },
        config: {
            responseMimeType: "application/json",
            responseSchema: vocabularyQuizSchema,
        },
    });

    const jsonString = response.text;
    try {
        const parsedJson = JSON.parse(jsonString);
        return parsedJson as { vocabularyQuestions: VocabularyQuestion[] };
    } catch (e) {
        console.error("Failed to parse JSON response for vocabulary quiz regeneration:", jsonString);
        throw new Error("The AI returned an invalid format for the new vocabulary quiz. Please try again.");
    }
};