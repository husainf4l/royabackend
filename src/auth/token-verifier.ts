import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import { SocialUserData } from './social-user.interface';

export class TokenVerifier {
  /**
   * Verify Google ID token and extract user information
   * @param idToken Google ID token
   */
  static async verifyGoogleToken(idToken: string): Promise<SocialUserData> {
    try {
      // Verify token with Google's API
      interface GoogleTokenResponse {
        email: string;
        sub: string;
        name?: string;
        picture?: string;
      }

      const response = await axios.get<GoogleTokenResponse>('https://www.googleapis.com/oauth2/v3/tokeninfo', {
        params: { id_token: idToken },
      });
      
      const { email, sub, name, picture } = response.data;
      
      if (!email) {
        throw new Error('Email not found in the Google token');
      }
      
      return {
        id: sub,
        email,
        name: name || email.split('@')[0],
        picture
      };
    } catch (error) {
      throw new Error(`Failed to verify Google token: ${error.message}`);
    }
  }

  /**
   * Verify Apple ID token and extract user information
   * @param idToken Apple ID token
   */
  static async verifyAppleToken(idToken: string): Promise<SocialUserData> {
    try {
      // For Apple verification, first we would need to fetch Apple's public keys
      const appleKeysResponse = await axios.get<{ keys: Array<{ kid: string }> }>('https://appleid.apple.com/auth/keys');
      
      // Decode the token header to get the key ID
      const decodedHeader: any = jwt.decode(idToken, { complete: true })?.header;
      if (!decodedHeader || !decodedHeader.kid) {
        throw new Error('Invalid Apple ID token format');
      }
      
      // Find the matching key
      const matchingKey = appleKeysResponse.data.keys.find(
        (key: any) => key.kid === decodedHeader.kid
      );
      
      if (!matchingKey) {
        throw new Error('No matching Apple public key found');
      }
      
      // For production, here we would convert the JWK to PEM format and verify the token
      // This is a simplified version for demonstration purposes
      const decoded: any = jwt.decode(idToken);
      
      if (!decoded || !decoded.email) {
        throw new Error('Invalid Apple token or missing email');
      }
      
      // Generate a consistent ID from the email address
      const emailHash = createHash('sha256').update(decoded.email).digest('hex');
      
      return {
        id: decoded.sub || emailHash,
        email: decoded.email,
        name: decoded.name || decoded.email.split('@')[0],
      };
    } catch (error) {
      throw new Error(`Failed to verify Apple token: ${error.message}`);
    }
  }
}
