import { Injectable, Logger } from '@nestjs/common';
import { DataPacket_Kind, RoomServiceClient } from 'livekit-server-sdk';
import { OpenAI } from 'openai';
import { authConfig } from '../../auth/config/auth.config';
import { Interval } from '@nestjs/schedule';

@Injectable()
export class CaptionService {
  private readonly logger = new Logger(CaptionService.name);
  private readonly openai: OpenAI;
  private readonly roomService: RoomServiceClient;
  private activeRooms: string[] = [];

  constructor() {
    this.openai = new OpenAI({ apiKey: authConfig.OPENAI_API_KEY });

    const serviceUrl = authConfig.livekit.host.replace('wss://', 'https://');
    this.roomService = new RoomServiceClient(
      serviceUrl,
      authConfig.livekit.apiKey,
      authConfig.livekit.apiSecret,
    );
  }

  setActiveRooms(rooms: string[]) {
    this.activeRooms = rooms;
    this.logger.log(`Set active rooms for automated captions: ${rooms.join(', ')}`);
  }

  addActiveRoom(roomName: string) {
    if (!this.activeRooms.includes(roomName)) {
      this.activeRooms.push(roomName);
      this.logger.log(`Added room ${roomName} to active caption rooms`);
    }
  }

  removeActiveRoom(roomName: string) {
    this.activeRooms = this.activeRooms.filter(room => room !== roomName);
    this.logger.log(`Removed room ${roomName} from active caption rooms`);
  }

  private generateRandomTopic(): string {
    const topics = [
      'الحكم يطالعني بدون أي تعبير واضح',
      'أحد الحضور يهمس للي جنبه',
      'ضحك خفيف من الحكم بعد الشرح',
      'أحس إني طولت بالكلام',
      'كل العيون علي وأنا أشرح',
      'سمعت أحدهم يقول "واو" بصوت خافت',
      'العد التنازلي على الشاشة بدأ',
      'أحد الحكام دون ملاحظة وهو ينظر لي',
      'واحد من الفريق نسى النقطة الجاية',
      'الحكم رفع حاجبه بعد ما قلت نقطة قوية',
    ];
    return topics[Math.floor(Math.random() * topics.length)];
  }

  private generateRandomEmotion(): string {
    const emotions = ['متوتر', 'واثق', 'متحمس', 'مرتبك', 'محايد'];
    return emotions[Math.floor(Math.random() * emotions.length)];
  }

  @Interval(10000)
  async sendRandomCaptions() {
    if (this.activeRooms.length === 0) return;

    const randomTopic = this.generateRandomTopic();
    const randomEmotion = this.generateRandomEmotion();
    this.logger.log(`🎯 Sending random caption with emotion "${randomEmotion}" to ${this.activeRooms.length} rooms`);

    for (const roomName of this.activeRooms) {
      try {
        await this.sendCaption(roomName, randomTopic, randomEmotion);
      } catch (error) {
        this.logger.error(`Failed to send automated caption to room ${roomName}: ${error.message}`);
      }
    }
  }

  async generateAiCaptionStream(topic: string, emotion: string): Promise<string> {
    const systemPrompt = `أنت الصوت الداخلي لمقدم سعودي يعرض مشروع Roya34 أمام لجنة تحكيم مباشرة. يتم عرض الكاميرا من وجهة نظره (POV) على الشاشة، ويظهر الحكام والحضور أمامه.

مهمتك هي توليد تعليق قصير باللغة العربية يُعبّر عن ما يفكر به المقدم في تلك اللحظة.

التفكير قد يكون متعلقًا بالحكام (هل أعجبهم العرض؟)، التوتر (هل أتكلم بسرعة؟)، الوقت (كم بقي؟)، أو الأجواء (هل تفاعلوا؟).

إذا تم تحديد الشعور (مثل: متوتر، واثق، متحمس، مرتبك)، اجعل نغمة الجملة مناسبة لهذا الشعور.

- لا تستخدم اللغة الرسمية.
- لا تشرح المشهد.
- لا تذكر التطبيق أو التفاصيل التقنية.
- فقط جملة شعور أو تفكير داخلي تعبّر عن اللحظة، أقل من 15 كلمة.

مثال:
- "أحس إني أتكلم بسرعة... بس مافي وقت!"
- "هل ضحك الحكم؟ ولا أنا أتوهم؟"
- "ركّز، باقي دقيقة وحدة!"
- "هز راسه... هذا شي كويس ولا؟"
`;

    const start = Date.now();
    const stream = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo',
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `المشهد: ${topic} - الشعور: ${emotion}` },
      ],
      temperature: 0.7,
    });

    let caption = '';
    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        caption += content;
      }
    }

    const elapsed = Date.now() - start;
    this.logger.log(`⚡ OpenAI stream completed in ${elapsed}ms`);
    return caption.trim();
  }

  async sendCaption(
    roomName: string,
    sceneDescription: string,
    emotion = 'محايد',
    durationMs = 8000,
  ): Promise<string> {
    try {
      const caption = await this.generateAiCaptionStream(sceneDescription, emotion);
      const payload = {
        type: 'caption',
        text: caption,
        duration: durationMs,
      };

      const message = Buffer.from(JSON.stringify(payload));
      await this.roomService.sendData(roomName, message, DataPacket_Kind.RELIABLE);
      this.logger.log(`✅ Caption sent to ${roomName}: ${caption}`);
      return caption;
    } catch (error) {
      this.logger.error(`❌ Failed to send caption: ${error.message}`, error.stack);
      throw error;
    }
  }
}
