import { Service } from '../models/Service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getAllServices = async (req, res, next) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    return successResponse(res, 'Services fetched', { services });
  } catch (error) {
    next(error);
  }
};

export const getServiceBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const service = await Service.findOne({ slug: slug.toLowerCase(), isActive: true });

    if (!service) {
      return errorResponse(res, 'Service not found', 404);
    }

    return successResponse(res, 'Service fetched', { service });
  } catch (error) {
    next(error);
  }
};
