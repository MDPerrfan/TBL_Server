import Service from "../models/Service.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getAllServices = asyncHandler(async (req, res) => {
  const services = await Service.find().sort({ createdAt: 1 });
  res.status(200).json(new ApiResponse(200, services));
});

export const createService = asyncHandler(async (req, res) => {
  const { title, description, image, href } = req.body;
  const service = await Service.create({ title, description, image, href });
  res.status(201).json(new ApiResponse(201, service, "Service created"));
});

export const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!service) throw new ApiError(404, "Service not found");
  res.status(200).json(new ApiResponse(200, service, "Service updated"));
});

export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) throw new ApiError(404, "Service not found");
  res.status(200).json(new ApiResponse(200, null, "Service deleted"));
});