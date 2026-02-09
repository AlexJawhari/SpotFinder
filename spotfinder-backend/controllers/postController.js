const { supabase } = require('../config/database');

// Normalizes incoming UUID fields from the client.
// Converts empty strings to null and ignores obvious external IDs (like 'osm_...').
const normalizeUuid = (value) => {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('osm_')) return null;
    return trimmed;
};

// Create post
exports.createPost = async (req, res) => {
    try {
        const { location_id, title, content, post_type } = req.body;
        const normalizedLocationId = normalizeUuid(location_id);

        const { data, error } = await supabase
            .from('posts')
            .insert([{
                created_by: req.user.id,
                location_id: normalizedLocationId,
                title,
                content,
                post_type
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all posts with filters
exports.getPosts = async (req, res) => {
    try {
        const { post_type, location_id, sort = 'newest' } = req.query;

        let query = supabase
            .from('posts')
            .select(`
        *,
        author:users!posts_created_by_fkey(id, username, email),
        location:locations(id, name, city)
      `);

        if (post_type) {
            query = query.eq('post_type', post_type);
        }

        if (location_id) {
            query = query.eq('location_id', location_id);
        }

        // Sorting
        switch (sort) {
            case 'hot':
                query = query.order('upvotes', { ascending: false });
                break;
            case 'top':
                query = query.order('upvotes', { ascending: false });
                break;
            case 'oldest':
                query = query.order('created_at', { ascending: true });
                break;
            default: // newest
                query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching posts:', error);
            return res.status(500).json({ error: error.message });
        }

        // Calculate comment_count for each post
        const postsWithCounts = await Promise.all(
            (data || []).map(async (post) => {
                try {
                    const { count, error: countError } = await supabase
                        .from('post_comments')
                        .select('id', { count: 'exact', head: true })
                        .eq('post_id', post.id);

                    if (countError) {
                        console.error('Error counting comments:', countError);
                    }

                    return {
                        ...post,
                        comment_count: count || 0
                    };
                } catch (err) {
                    console.error('Error processing post:', err);
                    return {
                        ...post,
                        comment_count: 0
                    };
                }
            })
        );

        res.json(postsWithCounts);
    } catch (error) {
        console.error('getPosts error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get single post
exports.getPost = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`
        *,
        author:users!posts_created_by_fkey(id, username, email),
        location:locations(id, name, city),
        comments:post_comments(*, author:users(id, username))
      `)
            .eq('id', req.params.id)
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update post
exports.updatePost = async (req, res) => {
    try {
        const { title, content, post_type } = req.body;

        // Check if user owns the post
        const { data: post } = await supabase
            .from('posts')
            .select('created_by')
            .eq('id', req.params.id)
            .single();

        if (!post || post.created_by !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { data, error } = await supabase
            .from('posts')
            .update({
                title,
                content,
                post_type,
                updated_at: new Date().toISOString()
            })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete post
exports.deletePost = async (req, res) => {
    try {
        // Check if user owns the post OR is site admin
        const { data: post } = await supabase
            .from('posts')
            .select('created_by')
            .eq('id', req.params.id)
            .single();

        const isCreator = post && post.created_by === req.user.id;
        const isAdmin = req.user.email === 'alexjw99@gmail.com' || req.user.email === 'admin@gmail.com' || req.user.isAdmin === true;

        if (!isCreator && !isAdmin) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Vote on post
exports.votePost = async (req, res) => {
    try {
        const { vote_type } = req.body; // upvote or downvote

        const { data, error } = await supabase
            .from('post_votes')
            .upsert({
                post_id: req.params.id,
                user_id: req.user.id,
                vote_type
            }, { onConflict: ['post_id', 'user_id'] })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Remove vote
exports.removeVote = async (req, res) => {
    try {
        const { error } = await supabase
            .from('post_votes')
            .delete()
            .eq('post_id', req.params.id)
            .eq('user_id', req.user.id);

        if (error) throw error;

        res.json({ message: 'Vote removed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add comment to post
exports.addComment = async (req, res) => {
    try {
        const { comment_text, parent_comment_id } = req.body;

        const { data, error } = await supabase
            .from('post_comments')
            .insert([{
                post_id: req.params.id,
                user_id: req.user.id,
                parent_comment_id,
                comment_text
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user's posts
exports.getUserPosts = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select(`
        *,
        location:locations(id, name, city)
      `)
            .eq('created_by', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Calculate comment_count for each post
        const postsWithCounts = await Promise.all(
            (data || []).map(async (post) => {
                const { count, error: countError } = await supabase
                    .from('post_comments')
                    .select('id', { count: 'exact', head: true })
                    .eq('post_id', post.id);

                if (countError) {
                    console.error('Error counting comments:', countError);
                }

                return {
                    ...post,
                    comment_count: count || 0
                };
            })
        );

        res.json(postsWithCounts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
