import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PostRequestDto, PostMood } from './dto/post-request.dto';
import { PostResponseDto } from './dto/post-response.dto';

@Injectable()
export class AIPostAgentService {
  private readonly openai: OpenAI;
  private readonly logger = new Logger(AIPostAgentService.name);

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  /**
   * Generates a social media post based on an image, hints, and mood
   * @param dto The post request data including image, hints, and mood
   * @returns A generated social media post with suggested hashtags
   */
  async generatePost(dto: PostRequestDto): Promise<PostResponseDto> {
    try {
      // Check if image is provided
      if (!dto || !dto.image) {
        throw new BadRequestException('Image is required for post generation.');
      }

      // Validate the image format
      if (!this.isValidImageFormat(dto.image)) {
        throw new BadRequestException('Image format not supported. Please provide an image in png, jpeg, gif, or webp format.');
      }

      // Generate the post using the common method
      return this.processPostGeneration(dto.image, dto.hints, dto.mood);
    } catch (error) {
      this.logger.error('Error generating social media post:', error);
      throw error;
    }
  }

  /**
   * Generates a social media post based on a binary image file, hints, and mood
   * @param file The uploaded image file
   * @param postData Object containing hints and mood
   * @returns A generated social media post with suggested hashtags
   */
  async generatePostFromBinary(
    file: Express.Multer.File,
    postData: { hints?: string; mood?: string }
  ): Promise<PostResponseDto> {
    try {
      if (!file || !file.buffer) {
        throw new BadRequestException('Image file is required for post generation.');
      }

      // Convert binary to base64
      const base64Image = this.binaryToBase64(file);
      
      // Get mood from string or use default
      const mood = postData.mood ? 
        (Object.values(PostMood).includes(postData.mood as PostMood) ? 
          postData.mood as PostMood : 
          PostMood.PROFESSIONAL) : 
        PostMood.PROFESSIONAL;

      // Generate the post using the common method
      return this.processPostGeneration(base64Image, postData.hints, mood);
    } catch (error) {
      this.logger.error('Error generating social media post from binary:', error);
      throw error;
    }
  }

  /**
   * Common post generation logic used by both base64 and binary image processors
   * @param imageData The image data (either base64 string or binary-converted-to-base64)
   * @param hints Optional hints for the post
   * @param mood The post mood
   * @returns A generated social media post
   */
  private async processPostGeneration(
    imageData: string, 
    hints?: string, 
    mood: PostMood = PostMood.PROFESSIONAL
  ): Promise<PostResponseDto> {
    // Determine mood instructions based on selected mood
    const moodInstructions = this.getMoodInstructions(mood);
    
    // Set up hints text - if none provided, use empty string
    const hintsText = hints ? `Include these hints/concepts in the post: ${hints}` : '';

    // Step 1: Analyze the image with Vision model
    const visionResponse = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `أنت منشئ محتوى احترافي متخصص في إنشاء محتوى رياضي للوسائط الاجتماعية.
          تقوم بإنشاء منشورات جذابة للوسائط الاجتماعية استناداً إلى الصور. ${moodInstructions}
          يجب أن تكون جميع المخرجات باللغة العربية الفصحى.`
        },
        {
          role: 'user',
          content: [
            { 
              type: 'text', 
              text: `حلل هذه الصورة الرياضية وأنشئ منشوراً جذاباً للوسائط الاجتماعية بناءً على ما تراه.
              يجب أن يكون منشورك جذاباً ومركزاً على العناصر الرئيسية في الصورة.
              ${hintsText}
              احرص على أن يكون المنشور موجزاً لكن مؤثراً (بحد أقصى 280 حرفاً).
              يجب أن يكون المنشور باللغة العربية.` 
            },
            {
              type: 'image_url',
              image_url: {
                url: imageData
              }
            }
          ]
        }
      ],
      max_tokens: 500,
    });

    const visionResult = visionResponse.choices[0]?.message?.content || '';
    this.logger.debug(`Vision analysis result: ${visionResult}`);

    // Step 2: Generate structured post with hashtags
    const finalPrompt = `
بناءً على مسودة منشور الوسائط الاجتماعية هذه حول صورة رياضية:

"${visionResult}"

قم بإنشاء رد منظم يحتوي على:
1. نص منشور محسّن للوسائط الاجتماعية (بحد أقصى 280 حرفاً)
2. 3-5 هاشتاغات ذات صلة (بدون شروحات، فقط الهاشتاغات)

قم بتنسيق ردك على شكل كائن JSON صالح بهذه الحقول بالضبط:
{
  "postText": "نص المنشور المحسن هنا",
  "hashtags": ["#هاشتاغ1", "#هاشتاغ2", "#هاشتاغ3"]
}

يجب أن يحافظ المنشور على نبرة ${mood} وأن يدمج أي تلميحات مقدمة.
يجب أن يكون المحتوى بالكامل باللغة العربية.
`;

    const finalResponse = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'أنت مدير وسائط اجتماعية محترف يقوم بإنشاء محتوى منظم باللغة العربية.' },
        { role: 'user', content: finalPrompt }
      ],
      max_tokens: 350,
      response_format: { type: 'json_object' },
    });

    const jsonResponse = finalResponse.choices[0]?.message?.content || '{}';
    this.logger.debug(`Final JSON response: ${jsonResponse}`);
    
    // Parse the structured response
    const parsedResponse = JSON.parse(jsonResponse) as {
      postText: string;
      hashtags: string[];
    };
    
    // Create and return the final response
    const response: PostResponseDto = {
      postText: parsedResponse.postText,
      hashtags: parsedResponse.hashtags,
      mood: mood,
      generatedAt: new Date().toISOString()
    };
    
    return response;
  }

  /**
   * Converts a binary file to base64 format suitable for OpenAI API
   * @param file The multer file object containing binary data
   * @returns A base64 string with appropriate mime type prefix
   */
  private binaryToBase64(file: Express.Multer.File): string {
    // Get the mime type from the file or infer it from the extension
    const mimeType = file.mimetype || this.getMimeTypeFromFilename(file.originalname);
    
    // Convert buffer to base64
    const base64 = file.buffer.toString('base64');
    
    // Return in the format required by OpenAI
    return `data:${mimeType};base64,${base64}`;
  }

  /**
   * Infers mime type from filename extension
   * @param filename The original filename
   * @returns A mime type string
   */
  private getMimeTypeFromFilename(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/jpeg'; // Default fallback
    }
  }

  /**
   * Validates that the image format is supported by OpenAI
   * @param base64Image The base64 image string with mime type prefix
   * @returns boolean indicating if the format is valid
   */
  private isValidImageFormat(base64Image: string): boolean {
    const supportedFormats = ['png', 'jpeg', 'jpg', 'gif', 'webp'];
    const mimeTypeMatch = base64Image.match(/^data:image\/([a-zA-Z0-9]+);base64,/);
    
    if (!mimeTypeMatch) {
      return false;
    }
    
    const format = mimeTypeMatch[1].toLowerCase();
    return supportedFormats.includes(format);
  }

  /**
   * Gets instructions for generating content with a specific mood
   * @param mood The desired mood for the post
   * @returns Instructions string for the AI
   */
  private getMoodInstructions(mood: PostMood): string {
    switch (mood) {
      case PostMood.EXCITED:
        return 'قم بإنشاء منشور حماسي ومليء بالطاقة باستخدام علامات التعجب واللغة العاطفية، ونقل الإثارة والشغف.';
      
      case PostMood.PROFESSIONAL:
        return 'قم بإنشاء منشور متقن ورسمي باستخدام لغة رسمية ومصطلحات دقيقة، والحفاظ على نبرة متوازنة وإعلامية.';
      
      case PostMood.FUNNY:
        return 'قم بإنشاء منشور فكاهي باستخدام لعب الكلمات أو النكات الخفيفة أو الملاحظات المرحة مع البقاء مناسباً لمشجعي الرياضة.';
      
      case PostMood.INSPIRATIONAL:
        return 'قم بإنشاء منشور ملهم يركز على التصميم والتغلب على التحديات أو الاحتفال بالإنجازات بلغة تحفيزية.';
      
      case PostMood.INFORMATIVE:
        return 'قم بإنشاء منشور يركز على الحقائق ويسلط الضوء على الإحصاءات الرئيسية أو السياق أو المحتوى التعليمي حول ما يظهر في الصورة.';
      
      case PostMood.CASUAL:
        return 'قم بإنشاء منشور محادثة باستخدام اللغة اليومية، كما لو كنت تتحدث مع صديق، بنبرة مريحة وودية.';
      
      default:
        return 'قم بإنشاء منشور متوازن واحترافي مناسب لمشجعي الرياضة بشكل عام.';
    }
  }
}