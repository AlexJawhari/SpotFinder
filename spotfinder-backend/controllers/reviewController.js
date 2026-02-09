const { validationResult } = require('express-validator');
const { supabase } = require('../config/database');

const getReviewsForLocation = async (req, res, next) => {
  try {
    const { locationId } = req.params;

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('location_id', locationId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (err) {
    return next(err);
  }
};

const createReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const {
      location_id,
      overall_rating,
      wifi_rating,
      seating_rating,
      noise_rating,
      review_text,
      visit_date,
      image_url
    } = req.body;

    const payload = {
      location_id,
      user_id: userId,
      overall_rating,
      wifi_rating,
      seating_rating,
      noise_rating,
      review_text,
      visit_date: visit_date || null,
      image_url,
    };

    const { data, error } = await supabase.from('reviews').insert(payload).select('*').single();
    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    return next(err);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    if (review.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to edit this review' });
    }

    const { data, error } = await supabase
      .from('reviews')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    return next(err);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const isAdmin = req.user.email === 'alexjw99@gmail.com' || req.user.email === 'admin@gmail.com' || req.user.isAdmin === true;

    if (review.user_id !== userId && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;

    res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getReviewsForLocation,
  createReview,
  updateReview,
  deleteReview,
};

