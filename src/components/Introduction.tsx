export const Introduction = () => {
  return (
    <div className="text-center mb-10 px-2 sm:px-4">
      {/* Product Hunt Badge */}
      <div className="flex justify-center p-2">
        <a
          href="https://www.producthunt.com/posts/ilovegithub?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-ilovegithub"
          target="_blank"
        >
          <img
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=967157&theme=light&t=1747590463334"
            alt="iLoveGithub - A&#0032;curated&#0032;collection&#0032;of&#0032;magical&#0032;tools&#0032;built&#0032;around&#0032;GitHub&#0032; | Product Hunt"
            width="250"
            height="54"
          />
        </a>
      </div>
      <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-github-blue to-github-green bg-clip-text text-transparent mb-4">
        Discover GitHub Tools
      </h1>
      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-4">
        Explore GitHub repositories and find the best tools to enhance your
        GitHub experience
      </p>
    </div>
  );
};
