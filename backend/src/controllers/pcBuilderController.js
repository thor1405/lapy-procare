import { PCComponent } from '../models/PCComponent.js';
import { CustomPCBuild } from '../models/CustomPCBuild.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getComponents = async (req, res, next) => {
  try {
    const { category, useCase } = req.query;
    const query = { inStock: true };

    if (category) {
      query.category = category;
    }

    if (useCase) {
      query.recommendedUseCases = useCase;
    }

    const components = await PCComponent.find(query).sort({ category: 1, price: 1 });
    return successResponse(res, 'PC Components fetched', { components });
  } catch (error) {
    next(error);
  }
};

/**
 * Validates hardware compatibility and computes price + wattage
 */
const validateBuildCompatibility = async (componentIds) => {
  const ids = Object.values(componentIds).filter(Boolean);
  const components = await PCComponent.find({ _id: { $in: ids } });

  const compMap = {};
  components.forEach((c) => {
    compMap[c.category] = c;
  });

  const issues = [];
  let totalPrice = 0;
  let totalTdp = 0;

  components.forEach((c) => {
    totalPrice += c.price;
    if (c.specifications?.wattage) {
      totalTdp += c.specifications.wattage;
    }
  });

  const cpu = compMap['Processor'];
  const mobo = compMap['Motherboard'];
  const ram = compMap['RAM'];
  const psu = compMap['Power Supply'];

  // Check CPU & Motherboard socket
  if (cpu && mobo) {
    const cpuSocket = cpu.specifications?.socket;
    const moboSocket = mobo.specifications?.socket;
    if (cpuSocket && moboSocket && cpuSocket.toLowerCase() !== moboSocket.toLowerCase()) {
      issues.push(`CPU socket mismatch: ${cpu.name} (${cpuSocket}) is incompatible with Motherboard (${moboSocket}).`);
    }
  }

  // Check Motherboard & RAM memory type
  if (mobo && ram) {
    const moboRam = mobo.specifications?.memoryType;
    const ramType = ram.specifications?.memoryType;
    if (moboRam && ramType && moboRam.toLowerCase() !== ramType.toLowerCase()) {
      issues.push(`RAM type mismatch: ${mobo.name} requires ${moboRam}, but selected ${ram.name} is ${ramType}.`);
    }
  }

  // Check PSU Wattage
  if (psu) {
    const psuCapacity = psu.specifications?.wattage || 0;
    // Add 25% safety overhead
    const recommendedWattage = Math.round(totalTdp * 1.25);
    if (psuCapacity > 0 && psuCapacity < recommendedWattage) {
      issues.push(`Insufficient Power Supply: System estimated peak load is ~${recommendedWattage}W, but selected PSU is ${psuCapacity}W.`);
    }
  }

  return {
    isCompatible: issues.length === 0,
    issues,
    totalPrice,
    estimatedWattage: totalTdp,
    components: compMap,
  };
};

export const validateAndCalculateBuild = async (req, res, next) => {
  try {
    const { components } = req.body;
    if (!components) {
      return errorResponse(res, 'Component selection required', 400);
    }

    const result = await validateBuildCompatibility(components);
    return successResponse(res, 'Build compatibility calculated', result);
  } catch (error) {
    next(error);
  }
};

export const saveBuild = async (req, res, next) => {
  try {
    const { buildName, useCase, budgetTier, components, customerNotes } = req.body;

    const validation = await validateBuildCompatibility(components || {});

    const build = await CustomPCBuild.create({
      buildName: buildName || 'My Custom PC Build',
      customer: req.user._id,
      useCase: useCase || 'Gaming',
      budgetTier: budgetTier || 'Mid-Range',
      components: components || {},
      totalEstimatedPrice: validation.totalPrice,
      estimatedWattage: validation.estimatedWattage,
      compatibilityStatus: {
        isCompatible: validation.isCompatible,
        issues: validation.issues,
      },
      status: 'Saved',
      customerNotes: customerNotes || '',
    });

    return successResponse(res, 'Custom PC build saved successfully', { build }, 201);
  } catch (error) {
    next(error);
  }
};

export const getMyBuilds = async (req, res, next) => {
  try {
    const builds = await CustomPCBuild.find({ customer: req.user._id })
      .populate('components.processor')
      .populate('components.motherboard')
      .populate('components.ram')
      .populate('components.graphicsCard')
      .populate('components.storage')
      .populate('components.powerSupply')
      .populate('components.cabinet')
      .populate('components.cooling')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Builds fetched', { builds });
  } catch (error) {
    next(error);
  }
};

export const requestBuildQuote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const build = await CustomPCBuild.findById(id);

    if (!build) {
      return errorResponse(res, 'Build not found', 404);
    }

    if (build.customer.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }

    build.status = 'Quote Requested';
    await build.save();

    return successResponse(res, 'Quotation requested for this build. Our PC hardware experts will contact you with availability and delivery estimates.', { build });
  } catch (error) {
    next(error);
  }
};
