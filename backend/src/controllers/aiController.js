import { troubleshootQuery } from '../services/aiTroubleshootService.js';
import { BusinessSettings } from '../models/BusinessSettings.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const handleAIChat = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return errorResponse(res, 'Please provide a message or symptom description', 400);
    }

    // Check if AI assistant is enabled in settings
    const settings = await BusinessSettings.findOne();
    if (settings && settings.isAIAssistantEnabled === false) {
      return errorResponse(res, 'AI Virtual Assistant is currently disabled by administrator. Please use direct WhatsApp or call us.', 403);
    }

    const result = await troubleshootQuery(message);
    return successResponse(res, 'AI response generated', result);
  } catch (error) {
    next(error);
  }
};
