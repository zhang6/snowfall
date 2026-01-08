import { GoogleGenAI } from "@google/genai";

// 预设的20首浪漫冬日情诗，无需调用模型即可瞬间加载
const STATIC_POEMS = [
  "雪落满城，念你如初，\n寒风虽冷，心有暖炉，\n愿作飞雪，落你肩头，\n共赴白首，岁月温柔。",
  "冬日微光，雪色茫茫，\n你若回首，便是暖阳，\n手心温度，融化寒霜，\n此生与你，地久天长。",
  "窗外飞雪，屋内茶香，\n对坐无言，情意深长，\n世界纯白，唯你斑斓，\n时光静好，如梦一场。",
  "月色如水，雪落无声，\n思念成海，波涛翻涌，\n寄语风雪，带去深情，\n愿君安好，好梦独宠。",
  "漫天雪舞，似我心跳，\n每一片雪，都是祈祷，\n愿风停时，你能来到，\n拥我入怀，暮暮朝朝。",
  "寒夜虽长，有你便暖，\n雪落成诗，字字珠玑，\n红泥火炉，能饮一杯，\n与君同醉，不问归期。",
  "天地一色，素裹银装，\n我也想藏，藏进你心房，\n不受风寒，不惹尘霜，\n安然栖息，地老天荒。",
  "雪是冬的信，你是我的命，\n风起的时候，更想抱紧，\n世界再大，不过方寸，\n你在哪里，便是风景。",
  "梅花枝头，雪意阑珊，\n相思入骨，怎么能够，\n若是重逢，在下个路口，\n我定牵手，绝不回头。",
  "听雪落下，像你的情话，\n轻柔细腻，融化脸颊，\n不用多言，无需惊讶，\n爱是无声，最美的回答。",
  "纷纷扬扬，落满衣裳，\n那是想念，变了模样，\n想变成雪，替你抵挡，\n世间寒凉，护你安康。",
  "纯白世界，你是唯一，\n色彩斑斓，不及你眉眼，\n走过四季，看过流年，\n唯有爱你，从未改变。",
  "雪夜寂静，心跳可听，\n每一下动，都是为你，\n若雪知意，应懂深情，\n替我吻你，直到天明。",
  "冬天的风，吹来故事，\n关于相遇，关于相知，\n雪花作证，写下盟誓，\n此生不负，相爱成痴。",
  "街角路灯，拉长身影，\n雪花飘落，如梦初醒，\n原来是你，走进生命，\n从此以后，满天繁星。",
  "煮雪烹茶，等风也等你，\n雪落屋檐，滴答滴答，\n像极了心，在说话，\n说我爱你，无法自拔。",
  "冰雪聪明，不及你深情，\n万物凋零，唯爱长青，\n待到春暖，花开满径，\n依然是你，伴我远行。",
  "飞雪连天，遮不住眼，\n望穿秋水，只为一面，\n若能相见，何惧严寒，\n一眼万年，便是永远。",
  "寒风凛冽，吹不散誓言，\n大雪纷飞，盖不住爱恋，\n心若向阳，无惧深渊，\n有你在旁，便是春天。",
  "这一场雪，下的好认真，\n像我的爱，一往情深，\n愿这洁白，洗净红尘，\n留我与你，共度余生。"
];

export const generatePoemBatch = async (theme: string = "snow"): Promise<string[]> => {
  // 直接返回静态数据，不再调用 API，确保极速响应
  return Promise.resolve(STATIC_POEMS);
};

export const generateSnowmanImage = async (): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Using gemini-2.5-flash-image for image generation
    const modelId = "gemini-2.5-flash-image";
    
    // Updated prompt: 
    // 1. "No red colors" - specified icy blue/silver instead.
    // 2. "solid pure black background" - essential for the 'screen' blend mode to work (making it look transparent).
    // 3. High quality 3D cartoon style.
    const prompt = "A cute adorable 3D cartoon snowman, pure white snow texture, wearing a soft icy blue and silver scarf and knit beanie. NO RED colors. Glowing slightly, magical sparkles, cinematic moonlight lighting. The background must be strictly solid pure black (#000000) to allow for screen blending transparency. High quality, 8k resolution.";

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [{ text: prompt }]
      }
    });

    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating snowman image:", error);
    return null;
  }
};