/**
 * Authentication Middleware
 * 
 * WHY MIDDLEWARE IS IMPORTANT:
 * 
 * 1. DRY (Don't Repeat Yourself)
 *    - Without middleware, you copy/paste the same auth check in every protected route
 *    - If you need to change the auth logic, you'd have to update it in 10+ places
 *    - With middleware, you write it once and reuse it everywhere
 * 
 * 2. Separation of Concerns
 *    - Route handlers should focus on their business logic (saving sessions, fetching data)
 *    - Auth checking is a cross-cutting concern that belongs in its own layer
 *    - This makes code easier to read, test, and maintain
 * 
 * 3. Consistent Security
 *    - Easy to forget auth checks when adding new routes
 *    - Middleware ensures protection is applied uniformly
 *    - You can't accidentally expose a route
 * 
 * 4. Composability
 *    - You can chain multiple middleware: requireAuth → requireAdmin → routeHandler
 *    - Easy to add rate limiting, logging, etc. as separate middleware
 * 
 * 5. Testability
 *    - Middleware can be unit tested in isolation
 *    - Mock the auth service, test the middleware behavior
 */

const supabaseService = require('../services/supabase');

/**
 * Middleware that requires a valid JWT token
 * Attaches the authenticated user to req.user
 */
async function requireAuth(req, res, next) {
    try {
        // Check for Authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required. Please sign in.'
            });
        }

        // Extract token
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Invalid authorization format'
            });
        }

        // Verify token with Supabase
        const user = await supabaseService.verifyToken(token);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token. Please sign in again.'
            });
        }

        // Attach user to request object for use in route handlers
        req.user = user;
        
        // Continue to the next middleware or route handler
        next();
        
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            error: 'Authentication failed'
        });
    }
}

/**
 * Middleware that requires admin role
 * Must be used AFTER requireAuth
 */
async function requireAdmin(req, res, next) {
    try {
        // User should already be attached by requireAuth
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        // Fetch user profile to check role
        const profile = await supabaseService.getProfile(req.user.id);
        
        if (!profile || profile.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }

        // Attach profile to request
        req.profile = profile;
        next();
        
    } catch (error) {
        console.error('Admin middleware error:', error);
        return res.status(403).json({
            success: false,
            error: 'Access denied'
        });
    }
}

/**
 * Middleware that requires coach or admin role
 * Must be used AFTER requireAuth
 */
async function requireCoachOrAdmin(req, res, next) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const profile = await supabaseService.getProfile(req.user.id);
        
        if (!profile || !['coach', 'admin'].includes(profile.role)) {
            return res.status(403).json({
                success: false,
                error: 'Coach or admin access required'
            });
        }

        req.profile = profile;
        next();
        
    } catch (error) {
        console.error('Coach middleware error:', error);
        return res.status(403).json({
            success: false,
            error: 'Access denied'
        });
    }
}

/**
 * Optional auth - attaches user if token present, but doesn't require it
 * Useful for routes that work for both guests and authenticated users
 */
async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            if (token) {
                const user = await supabaseService.verifyToken(token);
                if (user) {
                    req.user = user;
                }
            }
        }
        
        // Always continue, even without auth
        next();
        
    } catch (error) {
        // Silently continue without user
        next();
    }
}

module.exports = {
    requireAuth,
    requireAdmin,
    requireCoachOrAdmin,
    optionalAuth
};
