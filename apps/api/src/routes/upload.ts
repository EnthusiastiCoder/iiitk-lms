import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import * as uploadService from "../services/upload.service.js";
import { BadRequestError } from "../utils/errors.js";

export const uploadRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const attachSchema = z.object({
  submissionId: z.string().uuid(),
  table: z.enum(["assignment_submissions", "project_submissions"]),
  fileUrl: z.string().url(),
});

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a file to Cloudinary
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload (max 10MB)
 *               folder:
 *                 type: string
 *                 description: Cloudinary folder path
 *                 default: uploads
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     url: { type: string }
 *                     publicId: { type: string }
 *       400: { description: No file provided or upload failed }
 */
uploadRouter.post("/", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new BadRequestError("No file provided");
    }

    const folder = (req.body.folder as string) || "uploads";
    const result = await uploadService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      folder
    );

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /upload/attach:
 *   post:
 *     summary: Attach a file URL to a submission
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [submissionId, table, fileUrl]
 *             properties:
 *               submissionId:
 *                 type: string
 *                 format: uuid
 *                 description: The submission record ID
 *               table:
 *                 type: string
 *                 enum: [assignment_submissions, project_submissions]
 *                 description: The submission table to update
 *               fileUrl:
 *                 type: string
 *                 format: uri
 *                 description: The file URL to attach
 *     responses:
 *       200:
 *         description: File attached to submission
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     fileUrls:
 *                       type: array
 *                       items: { type: string }
 *       400: { description: Validation error }
 *       404: { description: Submission not found }
 */
uploadRouter.post("/attach", async (req, res, next) => {
  try {
    const parsed = attachSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new BadRequestError(parsed.error.issues[0].message);
    }

    const { submissionId, table, fileUrl } = parsed.data;
    const fileUrls = await uploadService.addFileToSubmission(
      submissionId,
      table,
      fileUrl
    );

    res.json({ data: { fileUrls } });
  } catch (err) {
    next(err);
  }
});
