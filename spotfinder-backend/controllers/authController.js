// Auth controller: registration, login and basic profile update logic.
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { supabase } = require('../config/database');

const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const sanitizeUser = (user) => {
  if (!user) return null;
  // Only send fields the client actually needs; never leak password hashes.
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    default_radius: user.default_radius,
    preferred_amenities: user.preferred_amenities,
    reputation_score: user.reputation_score,
    profile_image: user.profile_image,
    created_at: user.created_at,
  };
};

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, username } = req.body;

    const { data: existing, error: existingError } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .limit(1);

    if (existingError) throw existingError;
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'Email or username already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const { data: created, error: createError } = await supabase
      .from('users')
      .insert({
        email,
        username,
        password_hash: passwordHash,
      })
      .select('*')
      .single();

    if (createError) {
      console.error('User creation error:', createError);
      // Check if it's an RLS error
      if (createError.code === '42501') {
        return res.status(500).json({ 
          error: 'Database configuration error. Please contact support.',
          details: 'RLS policy violation - service role key may not be configured correctly'
        });
      }
      throw createError;
    }

    const token = createToken(created.id);

    res.status(201).json({
      token,
      user: sanitizeUser(created),
    });
  } catch (err) {
    return next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = createToken(user.id);

    res.json({
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    return next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const { id } = req.user;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(sanitizeUser(user));
  } catch (err) {
    return next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { username, default_radius, preferred_amenities, profile_image } = req.body;

    const updates = {};
    if (username !== undefined) updates.username = username;
    if (default_radius !== undefined) updates.default_radius = default_radius;
    if (preferred_amenities !== undefined) updates.preferred_amenities = preferred_amenities;
    if (profile_image !== undefined) updates.profile_image = profile_image;

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    res.json(sanitizeUser(data));
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};

