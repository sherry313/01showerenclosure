import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation, useSearchParams } from 'react-router-dom'
import brandLogo from './assets/brand/dulifei-logo.png'
import productCatalog from './data/product-catalog.json'

const assetModules = import.meta.glob('./assets/**/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>
const asset = (path: string) => assetModules[`./assets/${path}`]

const nav = [
  ['/', 'Home'], ['/products', 'Products'], ['/factory', 'Factory'],
  ['/projects', 'Projects'], ['/certifications', 'Certifications'],
  ['/about', 'About'], ['/contact', 'Contact'],
] as const

const factoryImages = Array.from({ length: 12 }, (_, i) => asset(`factory/factory-${String(i + 1).padStart(2, '0')}.webp`))
const projectImages = Array.from({ length: 18 }, (_, i) => asset(`projects/project-${String(i + 1).padStart(2, '0')}.webp`))

type ProductStatus = 'CONFIRMED' | 'NEEDS_CONFIRMATION'
type CatalogProduct = {
  id: string
  model: string | null
  name: string
  status: ProductStatus
  category: string
  sourceGroup: string
  originalSource: string
  primaryDerivedAsset: string
  detailUrl: string | null
  featured: boolean
}
const catalogProducts = productCatalog.products as CatalogProduct[]
const confirmedProducts = catalogProducts.filter(product => product.status === 'CONFIRMED')
const productById = new Map(catalogProducts.map(product => [product.id, product]))
function getProduct(id: string) {
  const product = productById.get(id)
  if (!product) throw new Error(`Unknown canonical product: ${id}`)
  return product
}
const productImage = (product: CatalogProduct) => asset(product.primaryDerivedAsset)

const pageMeta: Record<string, [string, string]> = {
  '/': ['Shower Enclosure Manufacturer | Dulifei', 'Explore shower enclosures, manufacturing capabilities, completed installations and supporting supplier documentation.'],
  '/products': ['Shower Enclosures & Shower Doors | Dulifei', 'Explore Dulifei shower enclosure and shower door designs for distribution, project and OEM or ODM requirements.'],
  '/factory': ['Shower Enclosure Manufacturing | Dulifei', 'See Dulifei production environments, manufacturing processes and quality-focused workmanship.'],
  '/projects': ['Shower Enclosure Projects | Dulifei', 'View a curated gallery of completed shower enclosure and bathroom installations.'],
  '/certifications': ['Documentation & Compliance | Dulifei', 'Review available supplier safety-glass documentation supporting product and compliance discussions.'],
  '/about': ['About Dulifei Shower Enclosures', 'Learn about Dulifei product development, manufacturing, customization and B2B cooperation.'],
  '/contact': ['Get a Quote | Dulifei Shower Enclosures', 'Contact Dulifei to discuss shower enclosure products, project requirements and OEM or ODM cooperation.'],
  '/products/corner-shower-enclosures/d15131-corner-shower-enclosure': ['D15131 Corner Shower Enclosure | Dulifei', 'Explore the D15131 corner shower enclosure for B2B sourcing, project requirements, and OEM or ODM discussions. Contact Dulifei for specifications.'],
  '/products/corner-shower-enclosures/yr03-42-quadrant-shower-enclosure': ['YR03-42 Quadrant Shower Enclosure | Dulifei', 'Explore the Dulifei YR03-42 quadrant shower enclosure with curved corner, rail, roller and handle views. Specifications are available on request.'],
  '/products/fixed-shower-screens/fixed-shower-screen-family': ['Fixed Shower Screen Family | Dulifei', 'Explore Dulifei fixed shower screen applications shown in approved imagery. Contact us to discuss the right configuration and specifications.'],
  '/products/sliding-shower-doors/s1908-22-sliding-shower-door': ['S1908-22 Sliding Shower Door | Dulifei', 'Explore the Dulifei S1908-22 straight sliding shower door with full-product and mechanism views. Specifications are available on request.'],
  '/products/sliding-shower-doors/s41122-sliding-shower-door': ['S41122 Sliding Shower Door | Dulifei', 'Explore the S41122 sliding shower door for B2B sourcing, project requirements, and OEM or ODM discussions. Contact Dulifei for specifications.'],
  '/products/sliding-shower-doors/s41522-sliding-shower-door': ['S41522 Sliding Shower Door | Dulifei', 'Explore the S41522 sliding shower door for B2B sourcing, project requirements, and OEM or ODM discussions. Contact Dulifei for specifications.'],
  '/products/sliding-shower-doors/s89022-sliding-shower-door': ['S89022 Sliding Shower Door | Dulifei', 'Explore the Dulifei S89022 straight sliding shower door with full-product, handle and frame detail views. Contact us for specifications.'],
}

function Seo() {
  const { pathname } = useLocation()
  useEffect(() => {
    const [title, description] = pageMeta[pathname] || ['Page Not Found | Dulifei', 'The requested page could not be found.']
    document.title = title
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta) }
    meta.content = description
    let ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')
    if (!ogTitle) { ogTitle = document.createElement('meta'); ogTitle.setAttribute('property', 'og:title'); document.head.appendChild(ogTitle) }
    ogTitle.content = title
    let ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]')
    if (!ogDescription) { ogDescription = document.createElement('meta'); ogDescription.setAttribute('property', 'og:description'); document.head.appendChild(ogDescription) }
    ogDescription.content = description
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

function Mark() {
  return <Link className="mark" to="/" aria-label="Dulifei home"><img src={brandLogo} alt="Dulifei London" /></Link>
}

function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const navRef = useRef<HTMLElement>(null)
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    document.body.classList.toggle('menu-open', open)
    if (!open) return () => document.body.classList.remove('menu-open')
    const focusable = Array.from(navRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') || [])
    focusable[0]?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        menuButtonRef.current?.focus()
        return
      }
      if (event.key !== 'Tab' || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.classList.remove('menu-open')
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])
  return <header className="site-header">
    <div className="header-inner">
      <Mark />
      <button ref={menuButtonRef} className="menu-button" type="button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>
        <span/><span/>
      </button>
      <nav ref={navRef} id="main-navigation" className={open ? 'main-nav open' : 'main-nav'} aria-label="Main navigation">
        {nav.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}
        <Link className="button button-small nav-cta" to="/contact">Get a Quote <Arrow /></Link>
      </nav>
    </div>
  </header>
}

function Footer() {
  return <footer className="site-footer">
    <div className="footer-lead container">
      <p className="eyebrow light">Start a conversation</p>
      <h2>Have a product or project in mind?</h2>
      <Link className="button button-invert" to="/contact">Discuss Your Project <Arrow /></Link>
    </div>
    <div className="footer-grid container">
      <div><Mark /><p>Shower enclosure solutions for international B2B cooperation.</p></div>
      <div><h3>Explore</h3>{nav.slice(1, 5).map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}</div>
      <div><h3>Company</h3>{nav.slice(5).map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}</div>
      <div><h3>Inquiries</h3><p>Tell us about your product, market or project requirements.</p><Link to="/contact">Request a quote <Arrow /></Link></div>
    </div>
    <div className="footer-bottom container"><span>© {new Date().getFullYear()} Dulifei Shower Enclosures</span><span>International B2B Website</span></div>
  </footer>
}

function Arrow() { return <span aria-hidden="true">↗</span> }

function Layout() { return <><Seo/><Header/><main><Routes>
  <Route path="/" element={<Home/>}/><Route path="/products" element={<Products/>}/><Route path="/products/:category/:product" element={<ProductDetail/>}/><Route path="/factory" element={<Factory/>}/><Route path="/projects" element={<Projects/>}/><Route path="/certifications" element={<Certifications/>}/><Route path="/about" element={<About/>}/><Route path="/contact" element={<Contact/>}/><Route path="*" element={<NotFound/>}/>
  </Routes></main><Footer/></> }

type SectionHeadProps = { eyebrow: string; title: string; text?: string; action?: ReactNode }
function SectionHead({ eyebrow, title, text, action }: SectionHeadProps) {
  return <div className="section-head"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{text && <p>{text}</p>}{action}</div>
}

function Image({ src, alt, eager = false }: { src: string; alt: string; eager?: boolean }) {
  return <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} />
}

function Home() {
  return <>
    <section className="hero">
      <Image src={asset('hero/product-hero.webp')} alt="Architectural shower enclosure by Dulifei" eager />
      <div className="hero-shade"/><div className="hero-content container"><p className="eyebrow light">Shower Enclosures for B2B Markets</p><h1>Premium Shower Enclosures, Built for Global Markets</h1><p className="hero-copy">Explore shower enclosure solutions for distribution, wholesale, development, and project-based procurement.</p><div className="button-row"><Link className="button button-invert" to="/products">Explore Products <Arrow /></Link><Link className="text-link light" to="/contact">Get a Quote <Arrow /></Link></div></div>
      <div className="hero-note">Product-focused design<br/>Manufacturing-backed delivery</div>
    </section>

    <section className="section intro container"><SectionHead eyebrow="Product portfolio" title="Engineered around the way spaces are built." text="Explore a visual selection of shower enclosure formats suited to distribution, specification, and project applications." /></section>
    <section className="category-strip container">
      {[
        [getProduct('s41122'), 'Sliding Shower Doors'], [getProduct('d15131'), 'Corner Shower Enclosures'], [getProduct('fixed-screen-family'), 'Fixed Shower Screens']
      ].map(([product, name], i) => <Link className={`category-card card-${i+1}`} to="/products" key={name as string}><Image src={productImage(product as CatalogProduct)} alt={`${name} category`}/><span>{name as string}</span><Arrow/></Link>)}
    </section>

    <section className="section dark-section"><div className="container"><SectionHead eyebrow="A considered approach" title="From product intent to finished enclosure." text="Dulifei brings product presentation, manufacturing capability, and responsive B2B cooperation together in one focused process."/><div className="principles">
      {[['01','Product development','A practical approach to enclosure design, configuration, and finish selection.'],['02','Manufacturing focus','Real production environments and workmanship behind every product conversation.'],['03','Flexible cooperation','Support for distribution, project sourcing, and OEM or ODM requirements.']].map(([n,t,d])=><article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}
    </div></div></section>

    <section className="section container"><SectionHead eyebrow="Selected products" title="Clean lines. Versatile formats." action={<Link className="text-link" to="/products">View all products <Arrow/></Link>}/><div className="product-grid featured">{catalogProducts.filter(product => product.featured).map(product => {
      const content = <><div className="media"><Image src={productImage(product)} alt={`${product.name} by Dulifei`}/></div><h3>{product.name}</h3><p>Contact us for specifications.</p></>
      return product.detailUrl ? <Link className="product-card products-product-link" to={product.detailUrl} key={product.id}>{content}</Link> : <article className="product-card" key={product.id}>{content}</article>
    })}</div></section>

    <section className="split-feature"><div className="split-image"><Image src={factoryImages[0]} alt="Dulifei shower enclosure production environment"/></div><div className="split-copy"><p className="eyebrow light">Manufacturing</p><h2>Made where product detail matters.</h2><p>Our manufacturing story is grounded in real production environments, practical workmanship, and attention to product quality.</p><Link className="button button-invert" to="/factory">Explore Our Factory <Arrow/></Link></div></section>

    <section className="section container"><SectionHead eyebrow="Installed work" title="Enclosures in real spaces." text="A selection of completed installations, presented without unsupported project names or locations." action={<Link className="text-link" to="/projects">View projects <Arrow/></Link>}/><div className="project-preview">{projectImages.slice(0,4).map((src,i)=><div key={src} className={`preview-${i+1}`}><Image src={src} alt={`Completed shower enclosure installation ${i+1}`}/></div>)}</div></section>

    <section className="section cert-band"><div className="container cert-band-inner"><div><p className="eyebrow">Documented materials</p><h2>Compliance information, presented with care.</h2></div><p>Review the supplier documentation currently approved for public presentation. Contact our team if your market requires specific documentation.</p><Link className="text-link" to="/certifications">View documentation <Arrow/></Link></div></section>
    <section className="section container custom-section"><p className="eyebrow">OEM & ODM cooperation</p><h2>Bring your product direction.<br/>We’ll start with the right questions.</h2><p>Share your target application, preferred enclosure format, finish direction, and project context. Our team can discuss a suitable cooperation path.</p><Link className="button" to="/contact">Start an Inquiry <Arrow/></Link></section>
  </>
}

const productCategories = [
  { name: 'Sliding Shower Doors', text: 'Straight and alcove configurations supported by approved product imagery.', representativeId: 's41122' },
  { name: 'Corner Shower Enclosures', text: 'Polygonal and curved corner formats from identified product series.', representativeId: 'd15131' },
  { name: 'Fixed Shower Screens', text: 'A fixed-screen family presented while product-level details await confirmation.', representativeId: 'fixed-screen-family' },
] as const

type ProductDetailData = {
  productId: string
  introduction: string
  application: string
  features: string[]
  gallery: { src: string; alt: string; label: string }[]
  relatedIds: string[]
}

const productDetails: Record<string, ProductDetailData> = {
  '/products/corner-shower-enclosures/d15131-corner-shower-enclosure': {
    productId: 'd15131',
    introduction: 'D15131 is a polygonal corner shower enclosure presented through full-product views and product-specific hardware details. It offers a defined corner format for product sourcing and project discussions.',
    application: 'For bathroom layouts requiring a defined corner enclosure. Suitability for a specific project should be confirmed against the site requirements.',
    features: ['Polygonal corner configuration', 'Framed glass-panel composition', 'Elongated handle design', 'Product-specific connection details'],
    gallery: [
      { src: asset('product-details/d15131/d15131-full.webp'), alt: 'D15131 polygonal corner shower enclosure full view', label: 'Full enclosure' },
      { src: asset('product-details/d15131/d15131-handle-detail.webp'), alt: 'D15131 elongated shower enclosure handle detail', label: 'Handle detail' },
      { src: asset('product-details/d15131/d15131-upper-detail.webp'), alt: 'D15131 upper enclosure connection detail', label: 'Upper detail' },
      { src: asset('product-details/d15131/d15131-lower-detail.webp'), alt: 'D15131 lower enclosure connection detail', label: 'Lower detail' },
    ],
    relatedIds: ['s41122', 's41522'],
  },
  '/products/sliding-shower-doors/s41122-sliding-shower-door': {
    productId: 's41122',
    introduction: 'S41122 is a straight sliding shower door shown in rendered and installed views with product-specific roller and hardware details. Its alcove format supports focused sourcing and project discussions.',
    application: 'For straight wall-to-wall or alcove shower openings. Suitability for a specific opening should be confirmed against the project requirements.',
    features: ['Straight alcove configuration', 'Sliding-door format', 'Visible upper roller detailing', 'Paired horizontal handle design'],
    gallery: [
      { src: asset('product-details/s41122/s41122-installed-full.webp'), alt: 'S41122 sliding shower door installed full frontal view', label: 'Installed view' },
      { src: asset('product-details/s41122/s41122-context.webp'), alt: 'S41122 sliding shower door in a bathroom setting', label: 'Product render' },
      { src: asset('product-details/s41122/s41122-installed-roller.webp'), alt: 'S41122 installed upper roller detail', label: 'Installed roller' },
      { src: asset('product-details/s41122/s41122-roller-detail.webp'), alt: 'S41122 roller assembly detail', label: 'Roller detail' },
    ],
    relatedIds: ['s41522', 'd15131'],
  },
  '/products/sliding-shower-doors/s41522-sliding-shower-door': {
    productId: 's41522',
    introduction: 'S41522 is a straight sliding shower door documented through installed and rendered views, product details, and video. Its alcove presentation supports product review for sourcing and project inquiries.',
    application: 'For straight wall-to-wall or alcove shower openings. Suitability for a specific opening should be confirmed against the project requirements.',
    features: ['Straight alcove configuration', 'Sliding-door format', 'Enclosed track detailing', 'Paired horizontal handle design'],
    gallery: [
      { src: asset('product-details/s41522/s41522-installed-full.webp'), alt: 'S41522 sliding shower door installed full frontal view', label: 'Installed view' },
      { src: asset('product-details/s41522/s41522-context.webp'), alt: 'S41522 sliding shower door product presentation', label: 'Product view' },
      { src: asset('product-details/s41522/s41522-track-profile.webp'), alt: 'S41522 lower track profile detail', label: 'Track profile' },
      { src: asset('product-details/s41522/s41522-handle-detail.webp'), alt: 'S41522 horizontal handle detail', label: 'Handle detail' },
    ],
    relatedIds: ['s41122', 'd15131'],
  },
  '/products/fixed-shower-screens/fixed-shower-screen-family': {
    productId: 'fixed-screen-family',
    introduction: 'The Fixed Shower Screen Family brings together fixed-panel applications documented in approved product imagery. This family-level presentation supports early product selection and project discussions while individual configurations and specifications are confirmed for each inquiry.',
    application: 'For walk-in shower zones and bathroom layouts that use a fixed panel to define the wet area. The appropriate configuration should be reviewed against the project layout and site requirements.',
    features: ['Fixed single-panel format', 'Dark-framed panel presentation', 'Vertically textured panel appearance', 'Bathroom applications shown in approved imagery'],
    gallery: [
      { src: asset('product-details/fixed-screen-family/fixed-screen-installed.webp'), alt: 'Installed vertically textured fixed shower screen in a bathroom setting', label: 'Installed application' },
      { src: asset('product-details/fixed-screen-family/fixed-screen-context-01.webp'), alt: 'Fixed shower screen shown in a complete bathroom setting', label: 'Bathroom context' },
      { src: asset('product-details/fixed-screen-family/fixed-screen-context-02.webp'), alt: 'Vertically textured fixed shower screen in an alternate bathroom layout', label: 'Alternate application' },
    ],
    relatedIds: ['yr03-42', 'd15131'],
  },
  '/products/sliding-shower-doors/s1908-22-sliding-shower-door': {
    productId: 's1908-22',
    introduction: 'S1908-22 is a straight sliding shower door documented through a full enclosure presentation and product-specific mechanism details. Its alcove format supports focused sourcing and project discussions.',
    application: 'For straight wall-to-wall or alcove shower openings. Suitability for a specific opening should be confirmed against the project requirements.',
    features: ['Straight alcove configuration', 'Sliding-door format', 'Visible upper mechanism detailing', 'Paired horizontal pull-handle design'],
    gallery: [
      { src: asset('product-details/s1908-22/s1908-22-full.webp'), alt: 'S1908-22 straight sliding shower door full bathroom presentation', label: 'Full product view' },
      { src: asset('product-details/s1908-22/s1908-22-mechanism.webp'), alt: 'S1908-22 upper sliding mechanism detail', label: 'Upper mechanism' },
      { src: asset('product-details/s1908-22/s1908-22-hardware.webp'), alt: 'S1908-22 product-specific sliding hardware presentation', label: 'Hardware detail' },
    ],
    relatedIds: ['s41122', 's41522'],
  },
  '/products/sliding-shower-doors/s89022-sliding-shower-door': {
    productId: 's89022',
    introduction: 'S89022 is a straight sliding shower door shown through a complete bathroom presentation and product-specific handle and frame details. The available views support product review for sourcing and project inquiries.',
    application: 'For straight wall-to-wall or alcove shower openings. Suitability for a specific opening should be confirmed against the project requirements.',
    features: ['Straight alcove configuration', 'Sliding-door format', 'Framed glass-panel presentation', 'Rectangular pull-handle detailing'],
    gallery: [
      { src: asset('product-details/s89022/s89022-full.webp'), alt: 'S89022 straight sliding shower door full bathroom presentation', label: 'Full product view' },
      { src: asset('product-details/s89022/s89022-handle.webp'), alt: 'S89022 paired rectangular pull-handle detail', label: 'Handle detail' },
      { src: asset('product-details/s89022/s89022-frame-detail.webp'), alt: 'S89022 upper frame and sliding-panel detail', label: 'Frame detail' },
    ],
    relatedIds: ['s1908-22', 's41122'],
  },
  '/products/corner-shower-enclosures/yr03-42-quadrant-shower-enclosure': {
    productId: 'yr03-42',
    introduction: 'YR03-42 is a curved quadrant shower enclosure documented through a complete product view and product-specific rail, roller and handle details. Its corner format supports focused sourcing and project discussions.',
    application: 'For bathroom layouts requiring a curved corner enclosure. Suitability for a specific project should be confirmed against the site requirements.',
    features: ['Curved quadrant corner configuration', 'Paired front door panels', 'Visible curved upper rail and roller detailing', 'Paired vertical pull-handle design'],
    gallery: [
      { src: asset('product-details/yr03-42/yr03-42-full.webp'), alt: 'YR03-42 curved quadrant shower enclosure full view', label: 'Full product view' },
      { src: asset('product-details/yr03-42/yr03-42-rail.webp'), alt: 'YR03-42 curved upper rail detail', label: 'Curved rail' },
      { src: asset('product-details/yr03-42/yr03-42-roller.webp'), alt: 'YR03-42 curved sliding roller detail', label: 'Roller detail' },
      { src: asset('product-details/yr03-42/yr03-42-handle.webp'), alt: 'YR03-42 paired vertical pull-handle detail', label: 'Handle detail' },
    ],
    relatedIds: ['d15131', 'fixed-screen-family'],
  },
}

type PageHeroProps = { eyebrow: string; title: string; text: string; image?: string; variant?: 'products' | 'factory' | 'projects' }
function PageHero({ eyebrow, title, text, image, variant }: PageHeroProps) {
  const classes = ['page-hero', image && 'has-image', variant && `page-hero--${variant}`].filter(Boolean).join(' ')
  return <section className={classes}>{image && <Image src={image} alt="" eager/>}<div className="page-hero-overlay"/><div className="container page-hero-content"><p className={image ? 'eyebrow light':'eyebrow'}>{eyebrow}</p><h1>{title}</h1><p>{text}</p></div></section>
}

function Products() { return <>
  <section className="products-hero">
    <div className="products-hero-copy">
      <p className="eyebrow">Product range</p>
      <h1>Shower enclosures for considered spaces.</h1>
      <p className="products-hero-intro">Explore identified product families for distribution, project sourcing, and OEM or ODM discussions.</p>
      <div className="products-hero-actions"><a className="button" href="#product-portfolio">Explore Products <Arrow/></a><Link className="text-link" to="/contact">Get a Quote <Arrow/></Link></div>
      <div className="products-value-list" aria-label="Product cooperation highlights">
        <span>Product-led sourcing</span><span>OEM &amp; ODM discussion</span><span>Specifications on request</span>
      </div>
    </div>
    <div className="products-hero-media"><Image src={projectImages[1]} alt="Frameless shower enclosure in a finished contemporary bathroom" eager/></div>
  </section>

  <section className="section products-discovery container">
    <div className="products-section-heading"><div><p className="eyebrow">Explore by category</p><h2>Start with the enclosure format.</h2></div><a className="text-link" href="#product-portfolio">View all products <Arrow/></a></div>
    <div className="products-categories">{productCategories.map((category, index) => {
      const representative = getProduct(category.representativeId)
      return <a className={`products-category category-${index + 1}`} href="#product-portfolio" key={category.name}><Image src={productImage(representative)} alt={`${category.name} category`}/><div><h3>{category.name}</h3><p>{category.text}</p></div><Arrow/></a>
    })}</div>
  </section>

  <section className="section products-portfolio container" id="product-portfolio">
    <div className="products-section-heading products-portfolio-heading"><div><p className="eyebrow">Selected portfolio</p><h2>Distinct products, clearly presented.</h2></div><p>Each card represents one identified product or family. Contact us for specifications.</p></div>
    <div className="product-grid products-all-grid">{confirmedProducts.map((product) => {
      const content = <><div className="media"><Image src={productImage(product)} alt={`${product.name} by Dulifei`}/></div><p className="product-category-label">{product.category}</p><h3>{product.name}</h3><p>Contact us for specifications.</p></>
      return product.detailUrl ? <Link className="product-card products-product-card products-product-link" to={product.detailUrl} key={product.id}>{content}</Link> : <article className="product-card products-product-card" key={product.id}>{content}</article>
    })}</div>
  </section>
  <ProcessCTA/>
</> }

function ProductGallery({ product, label }: { product: ProductDetailData; label: string }) {
  const [selected, setSelected] = useState(0)
  const image = product.gallery[selected]
  return <div className="product-detail-gallery">
    <figure className="product-detail-stage"><Image src={image.src} alt={image.alt} eager/><figcaption className="sr-only">{image.label}. Image {selected + 1} of {product.gallery.length}.</figcaption></figure>
    <div className="product-detail-thumbnails" aria-label={`${label} product gallery`}>
      {product.gallery.map((item, index) => <button type="button" key={item.src} aria-label={`View ${item.label.toLowerCase()}`} aria-current={index === selected ? 'true' : undefined} onClick={() => setSelected(index)}><Image src={item.src} alt=""/><span>{String(index + 1).padStart(2, '0')}</span></button>)}
    </div>
  </div>
}

function ProductDetail() {
  const { pathname } = useLocation()
  const detail = productDetails[pathname]
  if (!detail) return <NotFound/>
  const product = getProduct(detail.productId)
  const inquiryLabel = product.model || product.name
  const quotePath = `/contact?interest=product-information&product=${encodeURIComponent(inquiryLabel)}`
  const relatedProducts = detail.relatedIds.map(getProduct).filter(item => item.id !== product.id && item.status === 'CONFIRMED' && item.detailUrl)
  return <>
    <nav className="product-breadcrumb container" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><Link to="/products">Products</Link><span>/</span><span>{product.category}</span><span>/</span><span aria-current="page">{inquiryLabel}</span></nav>
    <section className="product-detail-overview container">
      <ProductGallery key={product.id} product={detail} label={inquiryLabel}/>
      <div className="product-detail-summary">
        <p className="eyebrow">{product.category}</p>
        <h1>{product.name}</h1>
        <p className="product-detail-intro">{detail.introduction}</p>
        <div className="product-detail-actions"><Link className="button" to={quotePath}>Get a Quote <Arrow/></Link><Link className="text-link" to={quotePath}>Request Product Information <Arrow/></Link></div>
        <p className="product-detail-spec-note">Specifications available on request.</p>
      </div>
    </section>

    <section className="section product-detail-content container">
      <div className="product-detail-features"><p className="eyebrow">Product overview</p><h2>Evidence-led product details.</h2><ul>{detail.features.map(feature => <li key={feature}>{feature}</li>)}</ul></div>
      <div className="product-detail-application"><p className="eyebrow">Applications</p><h2>Defined around the project.</h2><p>{detail.application}</p></div>
    </section>

    <section className="section pale"><div className="container product-detail-cooperation">
      <div><p className="eyebrow">Customization</p><h2>Discuss the configuration your project requires.</h2><p>Share your target market, application, preferred visual direction, and project requirements. Our team can review the available product and cooperation options for your inquiry.</p></div>
      <div><p className="eyebrow">OEM &amp; ODM</p><h2>A product-focused B2B conversation.</h2><p>Contact our team to discuss product configuration, sourcing requirements, and a suitable cooperation path.</p></div>
    </div></section>

    <section className="section container product-detail-specifications"><p className="eyebrow">Specifications</p><div><h2>Product specifications</h2><p>Contact us for specifications.</p><Link className="text-link" to={quotePath}>Ask about {inquiryLabel} <Arrow/></Link></div></section>

    <section className="section process-cta product-quote-cta"><div className="container"><p className="eyebrow light">Product inquiry</p><h2>Discuss {inquiryLabel} with our team.</h2><p>Tell us about your market, application, or project requirements so we can review the available product information with you.</p><Link className="button button-invert" to={quotePath}>Get a Quote <Arrow/></Link></div></section>

    <section className="section container product-related"><SectionHead eyebrow="Related products" title="Continue exploring the range."/><div className="product-grid">{relatedProducts.map(item => <Link className="product-card products-product-card products-product-link" to={item.detailUrl!} key={item.id}><div className="media"><Image src={productImage(item)} alt={`${item.name} by Dulifei`}/></div><p className="product-category-label">{item.category}</p><h3>{item.name}</h3><span className="text-link">View Product <Arrow/></span></Link>)}</div></section>
  </>
}

function Factory() { return <><PageHero variant="factory" eyebrow="Manufacturing" title="A closer look at where the work happens." text="Real views of the Dulifei production environment, processes, equipment, and hands-on workmanship." image={factoryImages[0]}/><section className="section container"><SectionHead eyebrow="Inside the factory" title="Production in focus." text="These images document the people, environments, and process behind the finished enclosures. Detailed capability requirements can be discussed directly with our team."/><div className="factory-gallery">{factoryImages.map((src,i)=><figure key={src} className={`factory-${i+1}`}><Image src={src} alt={`Dulifei manufacturing environment view ${i+1}`}/><figcaption>{i % 3 === 0 ? 'Production environment' : i % 3 === 1 ? 'Manufacturing process' : 'Product workmanship'}</figcaption></figure>)}</div></section><section className="section pale"><div className="container"><SectionHead eyebrow="How we work" title="A practical path from requirement to production."/><div className="steps">{['Share your requirements','Review product direction','Confirm project details','Proceed with production planning'].map((x,i)=><div key={x}><span>0{i+1}</span><h3>{x}</h3></div>)}</div></div></section><ProcessCTA/></> }

function Projects() { return <><PageHero variant="projects" eyebrow="Completed installations" title="Shower enclosures in lived-in spaces." text="A visual record of completed bathroom installations using approved project photography." image={projectImages[15]}/><section className="section container"><SectionHead eyebrow="Project gallery" title="Real installations. Varied applications." text="Project identities and locations are not shown where they have not been verified for public use."/><div className="masonry-grid">{projectImages.map((src,i)=><figure key={src}><Image src={src} alt={`Completed shower enclosure installation ${i+1}`}/><figcaption>{i%3===0?'Custom Bathroom Installation':i%3===1?'Residential Installation':'Shower Enclosure Project'}</figcaption></figure>)}</div></section><ProcessCTA/></> }

const certs = [
  [asset('certifications/cert-sgcc.webp'),'SGCC Authorization','Supplier document'],
  [asset('certifications/cert-asnz.webp'),'AS/NZS 2208 StandardsMark Licence','Supplier document'],
  [asset('certifications/cert-ce.webp'),'EN 12150 Tempered Glass Test Report','Supplier report'],
]
function Certifications() { return <><PageHero eyebrow="Documentation" title="Supporting Safety-Glass Documentation" text="A focused presentation of approved public supplier materials. Contact us to discuss documentation relevant to your market or project."/><section className="section container"><div className="cert-grid">{certs.map(([src,title,text])=><article key={title}><div className="cert-image"><Image src={src} alt={`${title} document preview`}/></div><p className="eyebrow">Documentation</p><h2>{title}</h2><p>{text}</p></article>)}</div><div className="cert-disclaimer"><strong>Important document context</strong><p>These materials relate to the named glass suppliers. Their scope, current applicability, and relevance to a specific Dulifei product or destination market must be confirmed before use.</p></div><div className="disclosure"><h2>Need documentation for a specific market?</h2><p>Requirements vary by product and destination. Tell us what you need so the appropriate available material can be reviewed with you.</p><Link className="button" to="/contact">Contact Our Team <Arrow/></Link></div></section></> }

function About() { return <><PageHero eyebrow="About Dulifei" title="Product thinking, manufacturing focus, and open collaboration." text="Dulifei works with international B2B buyers across shower enclosure sourcing, product development, and project requirements."/><section className="section container about-grid"><div><p className="eyebrow">Our focus</p><h2>Shower enclosures, thoughtfully developed.</h2></div><div><p>Our work centers on shower enclosure products and the manufacturing decisions behind them—from overall configuration and visual proportion to the details that shape a finished installation.</p><p>We support conversations with distributors, importers, wholesalers, project buyers, contractors, and OEM or ODM partners. Each inquiry begins with the buyer’s real requirements, not assumptions.</p></div></section><section className="about-image"><Image src={factoryImages[4]} alt="Work inside the Dulifei production environment"/></section><section className="section container"><SectionHead eyebrow="B2B cooperation" title="A direct, product-led way of working."/><div className="principles light-principles">{[['01','Understand the brief','We begin with the intended product, application, market, and project context.'],['02','Discuss the options','Available configurations and cooperation requirements are reviewed clearly.'],['03','Move forward together','Next steps are shaped around the confirmed scope and information available.']].map(([n,t,d])=><article key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></article>)}</div></section><ProcessCTA/></> }

function Contact() {
  const [searchParams] = useSearchParams()
  const productRequestOptions = new Set(confirmedProducts.map(product => product.model || product.name))
  const requestedProductParam = searchParams.get('product') || ''
  const requestedProduct = productRequestOptions.has(requestedProductParam) ? requestedProductParam : ''
  const requestedInterest = searchParams.get('interest') === 'product-information' ? 'Product Information' : ''
  const [formStatus,setFormStatus] = useState<'idle'|'sending'|'success'|'error'>('idle')
  const [errors,setErrors] = useState<Record<string,string>>({})
  async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const form=e.currentTarget; const f=new FormData(form); const next:Record<string,string>={}; if(!String(f.get('name')||'').trim()) next.name='Please enter your name.'; if(!String(f.get('company')||'').trim()) next.company='Please enter your company.'; const email=String(f.get('email')||''); if(!/^\S+@\S+\.\S+$/.test(email)) next.email='Please enter a valid email address.'; if(!String(f.get('message')||'').trim()) next.message='Please tell us about your requirements.'; setErrors(next); if(Object.keys(next).length) return; setFormStatus('sending'); try { const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(f))}); if(!response.ok) throw new Error('Unable to send inquiry'); setFormStatus('success'); form.reset() } catch { setFormStatus('error') } }
  return <><PageHero eyebrow="Contact" title="Tell us what you’re looking for." text="Share your product, sourcing, or project requirements. Our team will receive your inquiry by email."/><section className="section container contact-layout"><div className="contact-aside"><p className="eyebrow">Get a quote</p><h2>Start with the essentials.</h2><p>Include the enclosure type, target market, application, preferred finishes, or any known project requirements.</p><div className="contact-list"><span>Product sourcing</span><span>Project requirements</span><span>OEM & ODM cooperation</span><span>Documentation requests</span></div></div><form className="inquiry-form" noValidate onSubmit={submit}>
    <Field label="Name" name="name" required error={errors.name}/><Field label="Company" name="company" required error={errors.company}/><Field label="Country or Region" name="region"/><Field label="Email" name="email" type="email" required error={errors.email}/><Field label="WhatsApp" name="whatsapp"/><label>Product Interest<select name="interest" defaultValue={requestedInterest}><option value="" disabled>Select an area</option><option>Product Information</option><option>Shower Enclosures</option><option>Shower Doors</option><option>Project Requirements</option><option>OEM & ODM Cooperation</option><option>Certification Documentation</option></select></label>{requestedProduct&&<label className="full">Product Model / Family<input name="product" value={requestedProduct} readOnly/></label>}<label className="full">Message <span aria-hidden="true">*</span><textarea name="message" rows={6} defaultValue={requestedProduct ? `I'm interested in ${requestedProduct}. Please share available specifications and cooperation information.` : ''} placeholder="Tell us about your product or project requirements." aria-invalid={!!errors.message}/>{errors.message&&<small role="alert">{errors.message}</small>}</label><input className="honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"/><div className="full form-end"><button className="button" type="submit" disabled={formStatus==='sending'}>{formStatus==='sending' ? 'Sending Inquiry…' : <>Send Inquiry <Arrow/></>}</button><p>Your details are used only to respond to this inquiry.</p></div>{formStatus==='success'&&<div className="form-status full" role="status"><strong>Your inquiry has been sent.</strong><span>Thank you. A confirmation email has been sent to the address you provided.</span></div>}{formStatus==='error'&&<div className="form-status form-status-error full" role="alert"><strong>We could not send your inquiry.</strong><span>Please try again shortly.</span></div>}
  </form></section></>
}
function Field({label,name,type='text',required=false,error}:{label:string;name:string;type?:string;required?:boolean;error?:string}) { return <label>{label} {required&&<span aria-hidden="true">*</span>}<input name={name} type={type} aria-invalid={!!error}/>{error&&<small role="alert">{error}</small>}</label> }

function ProcessCTA() { return <section className="section process-cta"><div className="container"><p className="eyebrow light">Your requirements, clearly discussed</p><h2>Looking for a product or project partner?</h2><p>Contact us to discuss available products, specifications, customization, and B2B cooperation.</p><Link className="button button-invert" to="/contact">Get a Quote <Arrow/></Link></div></section> }
function NotFound() { return <section className="not-found container"><p className="eyebrow">404</p><h1>Page not found.</h1><p>The page you requested does not exist or may have moved.</p><Link className="button" to="/">Return Home <Arrow/></Link></section> }

export default function App() { return <Layout/> }
