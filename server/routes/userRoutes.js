const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');


router.get('/', protect, userController.getUsers);

router.get('/:id', protect, userController.getUserById);


router.put('/:id', protect, userController.updateUser);

router.delete('/:id', protect, userController.deleteUser);

module.exports = router;