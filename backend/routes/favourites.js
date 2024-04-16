const express = require('express');
const router = express.Router();
const User = require('../models/User');

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    console.error('User is not authenticated');
    res.status(401).send('User is not authenticated');
}

router.get('/', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        const favourites = user.favourites;
        res.send(favourites);
    } catch (error) {
        console.error("Error occurred while fetching favourites ", error);
        res.status(500).send('An error occurred');
    }
});

router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id: itemId } = req.params;

        // find if the item is already in the favourites
        const user = await User.findById(userId);
        if (user.favourites.includes(itemId)) {
            res.status(400).send('Item already in favourites.');
            return;
        }

        await User.findByIdAndUpdate(userId, { $push: { favourites: itemId }});

        res.status(201).send('Item added to favourites.');
    } catch (error) {
        console.error("Error occurred while adding a favourite ", error);
        res.status(500).send('An error occurred');
    }
});

router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id: itemId } = req.params;
        await User.findByIdAndUpdate(userId, { $pull: { favourites: itemId }});
        res.status(201).send('Item removed from favourites.');
    } catch (error) {
        console.error("Error occurred while removing a favourite ", error);
        res.status(500).send('An error occurred');
    }
});

module.exports = router;