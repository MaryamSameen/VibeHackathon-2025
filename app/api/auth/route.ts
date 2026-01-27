import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { generateId } from '@/utils/helpers';

// Simple hash function for demo (use bcrypt in production)
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }
    
    const body = await request.json();
    const { action, email, password, name } = body;

    if (action === 'signup') {
      // Check if user exists - use maybeSingle() to avoid error when no user found
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      // If we found a user (not an error, but actual data), reject signup
      if (existingUser) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 400 }
        );
      }
      
      // If there was a real database error (not just "no rows"), handle it
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing user:', checkError);
        return NextResponse.json(
          { error: 'Database error' },
          { status: 500 }
        );
      }

      // Create new user
      const userId = generateId();
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          name,
          email,
          password_hash: simpleHash(password),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.created_at,
        }
      });
    }

    if (action === 'login') {
      // First, find user by email only
      const { data: user, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      // If no user found or database error
      if (findError || !user) {
        console.log('Login failed - user not found:', email);
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Check password hash
      const inputHash = simpleHash(password);
      if (user.password_hash !== inputHash) {
        console.log('Login failed - password mismatch for:', email);
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.created_at,
        }
      });
    }

    if (action === 'update') {
      const { userId, updates } = body;
      
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Failed to update user' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          createdAt: updatedUser.created_at,
        }
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
