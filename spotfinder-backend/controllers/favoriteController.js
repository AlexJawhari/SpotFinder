const { supabase } = require('../config/database');

const listFavorites = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('favorites')
      .select('id, location_id, created_at, locations(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    return next(err);
  }
};

const addFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { location_id } = req.body;

    if (!location_id) {
      return res.status(400).json({ error: 'location_id is required' });
    }

    const { data, error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, location_id })
      .select('*')
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    return next(err);
  }
};

const removeFavorite = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  listFavorites,
  addFavorite,
  removeFavorite,
};

