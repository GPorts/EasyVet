import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://upvcimcjhzejcryqruok.supabase.co', 'sb_publishable_ktIH5yC_L6sENVgX29Vpew_zAmXZ7Ir');

async function test() {
  const email = 'teste' + Date.now() + '@gmail.com';
  console.log("Trying to sign up with:", email);
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: 'password123',
  });
  console.log("Signup Result:");
  console.log("Data:", data);
  console.log("Error:", error);

  if (data.user) {
    const { error: clinicError } = await supabase
      .from('clinics')
      .insert({
        id: data.user.id,
        name: 'Minha Clinica Teste',
        slug: 'clinica-' + Date.now(),
        email: email,
        phone: '',
        address: '',
      });
    console.log("Clinic Insert Error:", clinicError);
  }
}
test();
