const GENRES = ["House","Techno","Minimal","Indie Dance","Organic House","Afro House","Electronica","Breakbeat","Jazz","Alternative","Disco","Downtempo","Ambient","Global Sounds","Other"];
const genreGroup = document.getElementById('genreGroup');
const genreOtherField = document.getElementById('genreOtherField');
const selectedGenres = new Set();
GENRES.forEach(g=>{
  const chip = document.createElement('div');
  chip.className='chip';
  chip.textContent=g;
  chip.onclick=()=>{
    chip.classList.toggle('active');
    if(selectedGenres.has(g)) selectedGenres.delete(g); else selectedGenres.add(g);
    if(g === 'Other'){
      genreOtherField.style.display = selectedGenres.has('Other') ? 'block' : 'none';
    }
  };
  genreGroup.appendChild(chip);
});

function buildSingleChoice(containerId, options, store){
  const el = document.getElementById(containerId);
  options.forEach(opt=>{
    const chip=document.createElement('div');
    chip.className='chip';
    chip.textContent=opt;
    chip.onclick=()=>{
      [...el.children].forEach(c=>c.classList.remove('active'));
      chip.classList.add('active');
      store.value = opt;
    };
    el.appendChild(chip);
  });
}
const passportChoice = {value:''};
buildSingleChoice('passportGroup', ["Yes","No"], passportChoice);
const repChoice = {value:''};
buildSingleChoice('repGroup', ["No","Booking Agency","Management","Record Label","Publisher"], repChoice);

const disciplineSelect = document.getElementById('discipline');
const disciplineOtherField = document.getElementById('disciplineOtherField');
disciplineSelect.addEventListener('change', ()=>{
  disciplineOtherField.style.display = disciplineSelect.value === 'Other' ? 'block' : 'none';
});

const bio = document.getElementById('bio');
const bioCount = document.getElementById('bioCount');
bio.addEventListener('input', ()=>{
  const words = bio.value.trim() ? bio.value.trim().split(/\s+/).length : 0;
  bioCount.textContent = words + (words === 1 ? ' word' : ' words');
  bioCount.style.color = (words > 0 && (words < 150 || words > 300)) ? '#ef290f' : '#7d7d7d';
});

window.addEventListener('scroll', ()=>{
  const h = document.documentElement;
  const scrolled = (h.scrollTop)/(h.scrollHeight - h.clientHeight) * 100;
  document.getElementById('rail').style.width = scrolled + '%';
});

function slugify(s){
  return (s||'unknown').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}

const val = id => { const el = document.getElementById(id); return el ? el.value : ''; };

document.getElementById('butikForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const errEl = document.getElementById('errMsg');

  const requiredIds = ['fullName','email','phone','country','city'];
  let firstMissing = requiredIds.find(id => !val(id).trim());
  if(!firstMissing && !val('discipline')) firstMissing = 'discipline';

  const declsOk = document.getElementById('d1').checked
    && document.getElementById('d2').checked
    && document.getElementById('d3').checked;

  if(firstMissing || !declsOk){
    errEl.style.display='block';
    const target = document.getElementById(firstMissing) || document.getElementById('d1');
    if(target){ target.focus({preventScroll:true}); target.scrollIntoView({behavior:'smooth', block:'center'}); }
    return;
  }
  errEl.style.display='none';

  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'SUBMITTING…';

  const data = {
    fullName: val('fullName'),
    artistName: val('artistName'),
    email: val('email'),
    phone: val('phone'),
    country: val('country'),
    city: val('city'),
    nationality: val('nationality'),
    dob: val('dob'),
    discipline: val('discipline'),
    disciplineOther: val('disciplineOther'),
    genres: [...selectedGenres],
    genreOther: val('genreOther'),
    yearsActive: val('yearsActive'),
    currentLocation: val('currentLocation'),
    bio: val('bio'),
    links: {
      spotify: val('spotify'),
      soundcloud: val('soundcloud'),
      bandcamp: val('bandcamp'),
      appleMusic: val('appleMusic'),
      beatport: val('beatport'),
      youtube: val('youtube'),
      instagram: val('instagram'),
      residentAdvisor: val('ra'),
      website: val('website'),
      pressKit: val('pressKit'),
      photos: val('photos'),
      logo: val('logo'),
      trackLinks: val('trackLinks')
    },
    latestRelease: val('latestRelease'),
    upcomingReleases: val('upcomingReleases'),
    labels: val('labels'),
    countriesPerformed: val('countriesPerformed'),
    notableVenues: val('notableVenues'),
    recentGigs: val('recentGigs'),
    upcomingBookings: val('upcomingBookings'),
    touringAvailability: val('touringAvailability'),
    passportAvailable: passportChoice.value,
    visaRestrictions: val('visaRestrictions'),
    represented: repChoice.value,
    repName: val('repName'),
    repExclusive: val('repExclusive'),
    igFollowers: val('igFollowers'),
    spotifyListeners: val('spotifyListeners'),
    ytSubs: val('ytSubs'),
    newsletter: val('newsletter'),
    whyButik: val('whyButik'),
    goals: val('goals'),
    howHelp: val('howHelp'),
    additional: val('additional'),
    submittedAt: new Date().toISOString()
  };

  try{
    const res = await fetch('/.netlify/functions/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if(!res.ok){
      const info = await res.json().catch(() => ({}));
      throw new Error(info.error || ('Server returned ' + res.status));
    }
  }catch(err){
    console.error('Submission error', err);
    submitBtn.disabled = false;
    submitBtn.textContent = 'SUBMIT APPLICATION';
    errEl.textContent = 'Something went wrong sending your application. Please try again, or email us directly.';
    errEl.style.display = 'block';
    errEl.scrollIntoView({behavior:'smooth', block:'center'});
    return;
  }

  document.getElementById('formWrap').style.display='none';
  document.getElementById('successScreen').style.display='block';
  window.scrollTo(0,0);
});
