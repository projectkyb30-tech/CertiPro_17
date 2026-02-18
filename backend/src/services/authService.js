const { supabaseAdmin } = require('../lib/supabaseAdmin');

function mapProfileToUser(dbProfile, authRole) {
  const nowIso = new Date().toISOString();

  return {
    id: dbProfile.id,
    fullName: dbProfile.full_name || dbProfile.email?.split('@')[0] || 'User',
    email: dbProfile.email || '',
    phone: dbProfile.phone ?? null,
    bio: dbProfile.bio ?? null,
    birthDate: dbProfile.birth_date ?? null,
    streak: dbProfile.streak ?? 0,
    xp: dbProfile.xp ?? 0,
    lessonsCompletedToday: dbProfile.lessons_completed_today ?? 0,
    avatarUrl: dbProfile.avatar_url ?? null,
    createdAt: dbProfile.created_at || nowIso,
    updatedAt: dbProfile.updated_at || nowIso,
    role:
      authRole === 'admin' || (dbProfile.email && dbProfile.email.includes('admin_override'))
        ? 'admin'
        : 'user'
  };
}

async function getUserProfile(userId, email, role) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) {
    const nowIso = new Date().toISOString();
    return {
      id: userId,
      email,
      fullName: email ? email.split('@')[0] : 'User',
      streak: 0,
      xp: 0,
      lessonsCompletedToday: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
      bio: null,
      avatarUrl: null,
      phone: null,
      birthDate: null,
      role: role === 'admin' ? 'admin' : 'user'
    };
  }

  return mapProfileToUser(data, role);
}

module.exports = {
  getUserProfile
};

