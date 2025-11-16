"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const taskController_1 = require("../controllers/taskController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Apply authentication to all task routes
router.use(auth_1.authenticateToken);
// GET /tasks
router.get('/', taskController_1.getTasks);
// POST /tasks
router.post('/', taskController_1.createTask);
// GET /tasks/:id
router.get('/:id', taskController_1.getTask);
// PATCH /tasks/:id
router.patch('/:id', taskController_1.updateTask);
// PUT /tasks/:id/toggle (special endpoint for toggling completion)
router.put('/:id/toggle', taskController_1.toggleTask);
// DELETE /tasks/:id
router.delete('/:id', taskController_1.deleteTask);
exports.default = router;
