import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  generate,
  create,
  remove,
  list,
  get,
  update,
  loadOwnProject,
} from "../controllers/projectController.js";
import { githubRoute, vercelRoute } from "./projectDeploy.js";

const projectRouter = express.Router();

projectRouter.get("/", requireAuth, list);
projectRouter.post("/", requireAuth, create);
projectRouter.get("/:id", requireAuth, get);
projectRouter.patch("/:id", requireAuth, update);
projectRouter.delete("/:id", requireAuth, remove);
projectRouter.post("/:id/generate", requireAuth, generate);

projectRouter.post("/:id/github", requireAuth, githubRoute(loadOwnProject));
projectRouter.post("/:id/deploy", requireAuth, vercelRoute(loadOwnProject));

export default projectRouter;