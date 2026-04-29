export const Introduction = () => {
  const badges = [
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
  ];

  const tags = ["100+ tools", "Open source", "Free forever", "GitHub-native"];

  return (
    <div className="relative text-center mb-10 px-4 pt-2 pb-6">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2
                   w-[600px] h-[280px] -z-10 blur-3xl
                   bg-[radial-gradient(ellipse_at_center,_#0366d618_0%,_transparent_70%)]
                   dark:bg-[radial-gradient(ellipse_at_center,_#0366d628_0%,_transparent_70%)]"
      />

      {/* Badges */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {badges.map((badge, i) => (
          <a
            key={i}
            href={badge.href}
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-75 hover:opacity-100 hover:scale-105 transition-all duration-200"
          >
            <img
              src={badge.src}
              alt={badge.alt}
              width={200}
              className="h-11 rounded-md shadow-sm"
            />
          </a>
        ))}
      </div>

      {/* Eyebrow */}
      <p
        className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em]
                    uppercase text-github-blue dark:text-blue-400 mb-3"
      >
        <span className="w-6 h-px bg-current opacity-60" />
        GitHub Tools Directory
        <span className="w-6 h-px bg-current opacity-60" />
      </p>

      {/* Heading — text-4xl on mobile avoids single-word wrapping on 375px screens */}
      <h1
        className="text-4xl sm:text-5xl 
                     font-bold tracking-tight leading-[1.08] mb-4"
      >
        <span className="text-foreground">Discover </span>
        <span className="bg-gradient-to-r from-github-blue to-github-green bg-clip-text text-transparent">
          GitHub
        </span>
        <span className="text-foreground"> Tools</span>
      </h1>

      {/* Subtitle */}
      <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed mb-6">
        Explore repositories and discover the best tools to transform your GitHub experience — all
        in one place.
      </p>

      {/* Tags */}
      <div className="flex flex-wrap justify-center gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full
                       bg-secondary text-secondary-foreground
                       ring-1 ring-border/50 hover:ring-github-blue/30
                       transition-all duration-200"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};
