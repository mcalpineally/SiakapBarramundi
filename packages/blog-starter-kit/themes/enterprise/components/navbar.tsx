import Image from 'next/image';
import Link from 'next/link';
import useRouter from 'next/router'; // Changed to default import
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Search } from './searchbar';

interface MenuItem {
	name: string;
	url: string;
	image: string;
}

export const Navbar = () => {
	const catMenuItems: MenuItem[] = [
	  { name: 'Kedi Bakımı', url: '/kedi-bakimi', image: '/assets/blog/navbar/kedi/1.avif?w=1600&h=840&fit=crop&crop=entropy&auto=compress,format&format=webp' },
	  { name: 'Kedi Beslenmesi', url: '/kedi-beslenmesi', image: '/assets/blog/navbar/kedi/2.webp?w=1600&h=840&fit=crop&crop=entropy&auto=compress,format&format=webp' },
	  { name: 'Kedi Irkları', url: '/kedi-irklari', image: '/assets/blog/navbar/kedi/3.avif?w=1600&h=840&fit=crop&crop=entropy&auto=compress,format&format=webp' },
	  { name: 'Kedi Sağlığı', url: '/kedi-sagligi', image: '/assets/blog/navbar/kedi/4.avif?w=1600&h=840&fit=crop&crop=entropy&auto=compress,format&format=webp' },
	  { name: 'Kedi Diğer', url: '/kedi-diger', image: '/assets/blog/navbar/kedi/5.avif?w=1600&h=840&fit=crop&crop=entropy&auto=compress,format&format=webp' },
	];
	
	const dogMenuItems: MenuItem[] = [
	  { name: 'Köpek Bakımı', url: '/kopek-bakimi', image: '/assets/blog/navbar/kopek/1.avif?w=1600&h=840&fit=crop&crop=entropy&auto=compress,format&format=webp' },
	  { name: 'Köpek Beslenmesi', url: '/kopek-beslenmesi', image: '/assets/blog/navbar/kopek/2.avif?w=1600&h=840&fit=crop&crop=entropy&auto=compress,format&format=webp' },
	  { name: 'Köpek Irkları', url: '/kopek-irklari', image: '/assets/blog/navbar/kopek/3.avif?w=1600&h=840&fit=crop&crop=entropy&auto=compress,format&format=webp' },
	  { name: 'Köpek Sağlığı', url: '/kopek-sagligi', image: '/assets/blog/navbar/kopek/4.avif?w=1600&h=840&fit=crop&crop=entropy&auto=compress,format&format=webp' },
	  { name: 'Köpek Diğer', url: '/kopek-diger', image: '/assets/blog/navbar/kopek/5.avif?w=1600&h=840&fit=crop&crop=entropy&auto=compress,format&format=webp' },
	];

	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [isSticky, setIsSticky] = useState(false);
	const [lastScrollY, setLastScrollY] = useState(0);
	const [isCatMenuOpen, setIsCatMenuOpen] = useState(false);
	const [isDogMenuOpen, setIsDogMenuOpen] = useState(false);
	const [isImagesLoaded, setIsImagesLoaded] = useState(false);
	const [currentHoverImage, setCurrentHoverImage] = useState<string | null>(null);
	const [preloadedImages, setPreloadedImages] = useState<Record<string, HTMLImageElement>>({});
	const [currentCatImage, setCurrentCatImage] = useState<string>('');
	const [currentDogImage, setCurrentDogImage] = useState<string>('');
	const [metaImages, setMetaImages] = useState<Record<string, string>>({});
	const [isMetaImagesLoaded, setIsMetaImagesLoaded] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [isVisible, setIsVisible] = useState(true);
	const navbarRef = useRef<HTMLDivElement>(null);
	const catMenuRef = useRef<HTMLDivElement>(null);
	const dogMenuRef = useRef<HTMLDivElement>(null);
	const mobileMenuRef = useRef<HTMLDivElement>(null);

	const [lastHoveredImage, setLastHoveredImage] = useState<string | null>(null);
	const [defaultCatImage, setDefaultCatImage] = useState<string>(catMenuItems[0].image);
	const [defaultDogImage, setDefaultDogImage] = useState<string>(dogMenuItems[0].image);

	const router = typeof window !== 'undefined' ? require('next/router') : null;

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 768);
		};

		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	const catImages = [
		'/assets/blog/navbar/all.png?w=1600&h=840&fit=crop&crop=entropy&auto=compress,format&format=webp&lazy=1',
		];

	const dogImages = [
		'/assets/blog/navbar/all.png?w=1600&h=840&fit=crop&crop=entropy&auto=compress,format&format=webp&lazy=1',
		];

	const getRandomImage = useCallback((items: MenuItem[]) => {
		const lastImage = localStorage.getItem('lastImage');
		let newImage;
		do {
		  newImage = items[Math.floor(Math.random() * items.length)].image;
		} while (newImage === lastImage && items.length > 1);
		localStorage.setItem('lastImage', newImage);
		return newImage;
	  }, []);

	const preloadImages = useCallback((images: string[]) => {
		const promises = images.map(
			(src) =>
				new Promise<void>((resolve, reject) => {
					const img = new (window.Image as any)() as HTMLImageElement;
					img.src = src;
					img.loading = 'lazy'; // Added lazy loading
					img.onload = () => resolve();
					img.onerror = (error) => reject(error);
				}),
		);

		Promise.all(promises)
			.then(() => {
				setIsImagesLoaded(true);
			})
			.catch((error) => {
				console.error('Failed to preload images:', error);
				setIsImagesLoaded(true); // Set to true even on error to prevent UI from being stuck
			});
	}, []);

	const toggleMobileMenu = useCallback(() => {
		setIsMobileMenuOpen((prev) => !prev);
		setIsCatMenuOpen(false);
		setIsDogMenuOpen(false);
	}, []);

	const toggleSearch = useCallback(() => setIsSearchOpen((prev) => !prev), []);

	const toggleCatMenu = useCallback(() => {
		setIsCatMenuOpen((prev) => !prev);
		setIsDogMenuOpen(false);
		setIsMobileMenuOpen(false);
		const newImage = getRandomImage(catMenuItems);
		setCurrentCatImage(newImage);
		setDefaultCatImage(newImage);
		setLastHoveredImage(null);
	  }, [getRandomImage, catMenuItems]);
	  
	  const toggleDogMenu = useCallback(() => {
		setIsDogMenuOpen((prev) => !prev);
		setIsCatMenuOpen(false);
		setIsMobileMenuOpen(false);
		const newImage = getRandomImage(dogMenuItems);
		setCurrentDogImage(newImage);
		setDefaultDogImage(newImage);
		setLastHoveredImage(null);
	  }, [getRandomImage, dogMenuItems]);

	  const closeAllMenus = useCallback(() => {
		setIsCatMenuOpen(false);
		setIsDogMenuOpen(false);
		setIsMobileMenuOpen(false);
		setCurrentHoverImage(null);
		setLastHoveredImage(null);
	  }, []);

	  useEffect(() => {
		const navbar = navbarRef.current;
		const pageTitles = document.querySelectorAll('h1.text-5xl.text-gray-900.font-semibold.mt-2.mb-5, h1.text-4xl.font-bold.text-slate-900.dark\\:text-neutral-50.mb-6');
		let navbarHeight = navbar ? navbar.offsetHeight : 0;
		let pageTitleHeight = 0;
		let ticking = false;
	  
		const calculateTitleHeight = () => {
		  pageTitleHeight = Array.from(pageTitles).reduce((total, title) => total + (title as HTMLElement).offsetHeight, 0);
		};
	  
		const controlNavbar = () => {
		  if (!ticking) {
			window.requestAnimationFrame(() => {
			  if (navbar) {
				const scrollY = window.scrollY;
				const triggerPoint = pageTitleHeight;
				
				if (scrollY > triggerPoint) {
				  if (scrollY > lastScrollY) {
					setIsVisible(false);
				  } else {
					setIsVisible(true);
				  }
				} else {
				  setIsVisible(true);
				}
				
				setLastScrollY(scrollY);
			  }
			  ticking = false;
			});
			ticking = true;
		  }
		};
	  
		const handleResize = () => {
		  if (navbar) {
			navbarHeight = navbar.offsetHeight;
			calculateTitleHeight();
		  }
		};
	  
		const handleClickOutside = (event: MouseEvent) => {
		  if (navbar && !navbar.contains(event.target as Node)) {
			closeAllMenus();
		  }
		};
	  
		if (typeof window !== 'undefined') {
		  window.addEventListener('scroll', controlNavbar);
		  window.addEventListener('resize', handleResize);
		  document.addEventListener('mousedown', handleClickOutside);
	  
		  // İlk yükleme için yükseklikleri hesapla
		  handleResize();
	  
		  return () => {
			window.removeEventListener('scroll', controlNavbar);
			window.removeEventListener('resize', handleResize);
			document.removeEventListener('mousedown', handleClickOutside);
		  };
		}
	  }, [lastScrollY, closeAllMenus]);

	useEffect(() => {
		router.events.on('routeChangeStart', closeAllMenus);
		return () => {
			router.events.off('routeChangeStart', closeAllMenus);
		};
	}, [router, closeAllMenus]);

	useEffect(() => {
		const allImages = [...catMenuItems, ...dogMenuItems].map(item => item.image);
		preloadImages(allImages);
	  }, [preloadImages]);



	  const handleMenuItemHover = useCallback((image: string) => {
		setCurrentHoverImage(image);
		setLastHoveredImage(image);
	  }, []);

	  const handleMenuAreaLeave = useCallback(() => {
		setCurrentHoverImage(null);
	  }, []);


	  const renderDropdownMenu = (
		items: MenuItem[],
		defaultImage: string,
		altText: string,
		description: React.ReactNode,
	  ) => (
		<div
		  className={`fixed ${isMobile ? 'left-1/2 w-3/4 -translate-x-1/2 transform' : 'left-1/2 w-3/5 -translate-x-1/2 transform'} z-50 mt-2 rounded-xl bg-white bg-opacity-70 px-8 py-6 shadow-lg backdrop-blur-md backdrop-filter`}
		  onMouseLeave={handleMenuAreaLeave}
		>
		  <div className="flex flex-col">
			<div className={`flex ${isMobile ? 'flex-col' : ''}`}>
			  <div className={isMobile ? 'mb-4 w-full' : 'w-1/2 pr-4'}>
				{isImagesLoaded && (
				  <Image
					src={currentHoverImage || lastHoveredImage || defaultImage}
					alt={altText}
					width={300}
					height={200}
					className="h-auto w-full rounded-lg object-cover"
					loading="lazy"
				  />
				)}
			  </div>
			  <div className={isMobile ? '-ml-4 -mr-8 pl-0 pt-4' : 'w-1/2 content-center pl-4'}>
				<div className="grid grid-cols-2 gap-x-0 gap-y-4">
				  {items.map((item, index) => (
					<div key={index}>
					  <Link
						href={item.url}
						className="block text-gray-800 hover:text-orange-500"
						onClick={closeAllMenus}
						onMouseEnter={() => handleMenuItemHover(item.image)}
					  >
						{item.name}
					  </Link>
					</div>
				  ))}
				</div>
			  </div>
			</div>
		  </div>
		</div>
	  );
	

	return (
		<>
			<nav
				ref={navbarRef}
				className={`container fixed left-0 right-0 top-0 z-50 mx-auto w-full select-none px-4 py-4 transition-all duration-500 ${
					isVisible ? 'translate-y-0' : '-translate-y-full'
				}`}
				style={
					{
						opacity: 1,
						zIndex: 2,
					} as React.CSSProperties
				}
			>
				<div
					className="mx-auto select-none rounded-xl bg-white/10 px-4 py-4 shadow-md sm:px-6 lg:px-8"
					style={{
						background: 'hsl(30.5, 100%, 87.6%)',
					}}
				>
					<div className="flex h-10 items-center justify-between">
						<div className="flex items-center">
							<Link rel="canonical" href="/">
								<div className="scale-160 relative bottom-4 flex h-[53px] w-[100px] origin-top-left items-center justify-start">
									<Image
										src="https://9kelt5xnesj2nkgz.public.blob.vercel-storage.com/file-eYpF3jWI7j8924LUC1AR51hcMjnVNp.png"
										alt="Ana Sayfa"
										fill
										sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
										style={{ objectFit: 'contain' }}
										loading="lazy"
									/>
								</div>
							</Link>
						</div>
						<div className="hidden w-full justify-end md:flex">
							<ul className="flex items-center space-x-8">
								<li className="mt-2" style={{ opacity: 1, transform: 'none' }}>
									<button onClick={toggleSearch} className="text-gray-800 hover:text-gray-600">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-6 w-6"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
											/>
										</svg>
									</button>
								</li>
								<li style={{ opacity: 1, transform: 'none' }}>
									<button
										onClick={toggleCatMenu}
										className="cursor-pointer font-bold text-gray-800 transition hover:text-gray-700/75"
										style={{ fontFamily: 'PinkChicken' }}
									>
										Kedi
									</button>
								</li>
								<li style={{ opacity: 1, transform: 'none' }}>
									<button
										onClick={toggleDogMenu}
										className="cursor-pointer font-bold text-gray-800 transition hover:text-gray-700/75"
										style={{ fontFamily: 'PinkChicken' }}
									>
										Köpek
									</button>
								</li>
								<li style={{ opacity: 1, transform: 'none' }}>
									<Link
										href="/"
										aria-label="Ana Sayfa"
										className="cursor-pointer font-bold text-gray-800 transition hover:text-gray-700/75"
										style={{ fontFamily: 'PinkChicken' }}
										rel="canonical"
									>
										<span>Ana Sayfa</span>
									</Link>
								</li>
								<li style={{ opacity: 1, transform: 'none' }}>
									<Link
										href="/iletisim"
										aria-label="İletişim"
										className="cursor-pointer font-bold text-gray-800 transition hover:text-gray-700/75"
										style={{ fontFamily: 'PinkChicken' }}
										rel="canonical"
									>
										<span>İletişim</span>
									</Link>
								</li>
							</ul>
						</div>
						<div className="flex items-center md:hidden">
							<ul className="mr-4 mt-2 space-y-2">
								<li style={{ opacity: 1, transform: 'none' }}>
									<button onClick={toggleSearch} className="text-gray-800 hover:text-gray-600">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-6 w-6"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
											/>
										</svg>
									</button>
								</li>
							</ul>
							<button
								className="relative h-6 w-6 text-gray-800 md:hidden"
								onClick={toggleMobileMenu}
								aria-label={isMobileMenuOpen ? 'Menüyü Kapat' : 'Menüyü Aç'}
							>
								{isMobileMenuOpen ? (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-6 w-6"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								) : (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-6 w-6"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 6h16M4 12h16M4 18h16"
										/>
									</svg>
								)}
							</button>
						</div>
					</div>
					{isMobileMenuOpen && (
						<div
							ref={mobileMenuRef}
							className="left-0 right-0 top-0 mt-2 rounded-b-xl px-4 py-2 md:hidden"
						>
							<ul className="mr-4 mt-2 space-y-2">
								<li>
									<button
										onClick={() => {
											toggleCatMenu();
											setIsMobileMenuOpen(false);
										}}
										className="block font-bold text-gray-800 hover:text-gray-700/75"
										style={{ fontFamily: 'PinkChicken' }}
									>
										Kedi
									</button>
								</li>
								<li>
									<button
										onClick={() => {
											toggleDogMenu();
											setIsMobileMenuOpen(false);
										}}
										className="block font-bold text-gray-800 hover:text-gray-700/75"
										style={{ fontFamily: 'PinkChicken' }}
									>
										Köpek
									</button>
								</li>
								<li>
									<Link
										href="/"
										className="block font-bold text-gray-800 hover:text-gray-700/75"
										style={{ fontFamily: 'PinkChicken' }}
										onClick={() => {
											setIsMobileMenuOpen(false);
											closeAllMenus();
										}}
										rel="canonical"
									>
										Ana Sayfa
									</Link>
								</li>
								<li>
									<Link
										href="/iletisim"
										className="block font-bold text-gray-800 hover:text-gray-700/75"
										style={{ fontFamily: 'PinkChicken' }}
										onClick={() => {
											setIsMobileMenuOpen(false);
											closeAllMenus();
										}}
										rel="canonical"
									>
										İletişim
									</Link>
								</li>
							</ul>
						</div>
					)}
				</div>
				{(isCatMenuOpen || isDogMenuOpen) && (
				<div ref={isCatMenuOpen ? catMenuRef : dogMenuRef}>
					{renderDropdownMenu(
					isCatMenuOpen ? catMenuItems : dogMenuItems,
					isCatMenuOpen ? currentCatImage : currentDogImage,
					isCatMenuOpen ? 'Kedi' : 'Köpek',
					isCatMenuOpen
						? 'Kediler hakkında bilmek istediğiniz her şey'
						: 'Köpekler hakkında bilmek istediğiniz her şey',
					)}
				</div>
				)}
			</nav>
			{isSearchOpen && (
				<div className="fixed inset-0 z-50 bg-black bg-opacity-50">
					<Search isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
				</div>
			)}
		</>
	);
};
