type BadgeType = {
  href: string;
  src: string;
  alt: string;
};

export const Introduction = () => {
  const badges: BadgeType[] = [
    {
      href: "https://www.producthunt.com/posts/ilovegithub?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-ilovegithub",
      src: "https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=967157&theme=light&t=1747590463334",
      alt: "iLoveGithub Product Hunt Badge",
    },
    {
      href: "https://peerlist.io/crackedngineer/project/ilovegithub",
      src: "https://peerlist.io/api/v1/projects/embed/PRJH8OEJ9OJ8E88PJ3R66977NBDAOK?showUpvote=true&theme=light",
      alt: "iLoveGithub Peerlist Badge",
    },
    {
      href: "https://scoutforge.net/reviews/ilovegithub/",
      src: "https://scoutforge.net/wp-content/themes/wp-theme/assets/img/badges/badge-light.webp",
      alt: "Trusted and Reviewed by Scout Forge Badge",
    },
  ];

  return (
    <div className="text-center mb-10 px-2 sm:px-4">
      {/* Badge Container without Background */}
      <div className="flex flex-wrap justify-center gap-4 p-2">
        {badges.map((badge: BadgeType, index) => (
          <a
            key={index}
            href={badge.href}
            target="_blank"
            rel="noopener noreferrer"
            className="transform hover:scale-105 transition duration-300"
          >
            {
              // eslint-disable-next-line @next/next/no-img-element
              <img src={badge.src} alt={badge.alt} className="rounded-md h-14" width={250} />
            }
          </a>
        ))}
      </div>

      <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-github-blue to-github-green bg-clip-text text-transparent mt-6 mb-4">
        Discover GitHub Tools
      </h1>
      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-4">
        Explore GitHub repositories and find the best tools to enhance your GitHub experience
      </p>
    </div>
  );
};
