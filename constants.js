const SEARCH_ENGINES = [
  // GENERAL
  ['baidu', 'baidu.com', 'general', 'General search engine from China'],
  ['bing', 'bing.com', 'general', 'Microsoft general web search engine'],
  ['brave', 'brave.com', 'general', 'Privacy-focused general search engine'],
  ['duckduckgo', 'duckduckgo.com', 'general', 'Privacy-focused general search engine'],
  ['google', 'google.com', 'general', 'Google general web search engine'],
  ['mojeek', 'mojeek.com', 'general', 'Independent general search engine'],
  ['qwant', 'qwant.com', 'general', 'Privacy-focused general search engine'],
  ['startpage', 'startpage.com', 'general', 'Privacy-focused general search engine'],
  ['yahoo', 'yahoo.com', 'general', 'Yahoo general web search engine'],
  ['yandex', 'yandex.com', 'general', 'Russian general search engine'],

  // IMAGES
  ['bing_images', 'bing.com', 'images', 'Bing image search engine'],
  ['deviantart', 'deviantart.com', 'images', 'DeviantArt image and art search'],
  ['flickr', 'flickr.com', 'images', 'Flickr photo sharing and search'],
  ['google_images', 'google.com', 'images', 'Google image search engine'],
  ['imgur', 'imgur.com', 'images', 'Imgur image hosting and search'],
  ['openclipart', 'openclipart.org', 'images', 'Open Clipart vector graphics search'],
  ['pixabay', 'pixabay.com', 'images', 'Free stock images and photos'],
  ['unsplash', 'unsplash.com', 'images', 'Free high-resolution photos'],
  ['wallhaven', 'wallhaven.cc', 'images', 'Wallpaper image search engine'],

  // VIDEOS
  ['bing_videos', 'bing.com', 'videos', 'Bing video search engine'],
  ['dailymotion', 'dailymotion.com', 'videos', 'Dailymotion video platform search'],
  ['invidious', 'youtube.com', 'videos', 'Privacy-friendly YouTube frontend'],
  ['peertube', 'peer.tube', 'videos', 'Decentralized video platform search'],
  ['vimeo', 'vimeo.com', 'videos', 'Vimeo video platform search'],
  ['youtube', 'youtube.com', 'videos', 'YouTube video search engine'],

  // NEWS
  ['bing_news', 'bing.com', 'news', 'Bing news search engine'],
  ['google_news', 'google.com', 'news', 'Google news search engine'],
  ['hackernews', 'news.ycombinator.com', 'it', 'Hacker News tech news search'],
  ['yahoo_news', 'yahoo.com', 'news', 'Yahoo news search engine'],

  // MAPS
  ['apple_maps', 'apple.com', 'maps', 'Apple Maps location search'],
  ['openstreetmap', 'openstreetmap.org', 'maps', 'OpenStreetMap location search'],
  ['photon', 'komoot.io', 'maps', 'OpenStreetMap geocoding search'],

  // MUSIC
  ['genius', 'genius.com', 'music', 'Song lyrics and music search'],
  ['soundcloud', 'soundcloud.com', 'music', 'SoundCloud music platform search'],

  // IT
  ['crates', 'crates.io', 'it', 'Rust packages search engine'],
  ['dockerhub', 'hub.docker.com', 'it', 'Docker container images search'],
  ['github', 'github.com', 'it', 'GitHub code repository search'],
  ['gitlab', 'gitlab.com', 'it', 'GitLab repository search engine'],
  ['npm', 'npmjs.org', 'it', 'Node.js packages search engine'],
  ['packagist', 'packagist.org', 'it', 'PHP packages search engine'],
  ['pypi', 'pypi.org', 'it', 'Python packages search engine'],
  ['rubygems', 'rubygems.org', 'it', 'Ruby gems search engine'],
  ['stackoverflow', 'stackoverflow.com', 'it', 'Stack Overflow Q&A search'],

  // ACADEMIC
  ['arxiv', 'arxiv.org', 'science', 'Academic papers and preprints'],
  ['crossref', 'crossref.org', 'academic', 'Academic publication metadata search'],
  ['google_scholar', 'scholar.google.com', 'science', 'Google Scholar academic search'],
  ['pubmed', 'ncbi.nlm.nih.gov', 'academic', 'Medical and life sciences search'],
  ['semantic_scholar', 'semanticscholar.org', 'science', 'AI-powered academic paper search'],
  ['wikidata', 'wikidata.org', 'general', 'Structured knowledge base search'],

  // SOCIAL
  ['mastodon', 'mastodon.social', 'social', 'Mastodon federated social network'],
  ['medium', 'medium.com', 'general', 'Medium blogging platform search'],
  ['reddit', 'reddit.com', 'social media', 'Reddit social media search'],
  ['twitter', 'twitter.com', 'social media', 'Twitter social media search'],

  // FILES
  ['annas_archive', 'annas-archive.org', 'specialized', "Anna's Archive books and papers"],
  ['archive', 'archive.org', 'general', 'Internet Archive digital library'],

  // TORRENTS
  ['1337x', '1337x.to', 'files', '1337x torrent search engine'],
  ['eztv', 'eztv.re', 'files', 'EZTV TV torrents search'],
  ['kickass', 'kickasstorrents.to', 'torrents', 'KickassTorrents search engine'],
  ['nyaa', 'nyaa.si', 'files', 'Nyaa anime torrents search'],
  ['solidtorrents', 'solidtorrents.to', 'torrents', 'Solidtorrents search engine'],
  ['thepiratebay', 'thepiratebay.org', 'files', 'The Pirate Bay torrent search'],
  ['yts', 'yts.mx', 'files', 'YTS movie torrents search'],

  // SHOPPING
  ['ebay', 'ebay.com', 'shopping', 'eBay marketplace search engine'],

  // SPECIALIZED
  ['goodreads', 'goodreads.com', 'specialized', 'Goodreads book reviews search'],
  ['imdb', 'imdb.com', 'videos', 'IMDb movie and TV database'],
  ['openlibrary', 'openlibrary.org', 'specialized', 'Open Library books search'],
  ['wikipedia', 'wikipedia.org', 'general', 'Wikipedia encyclopedia search'],
  ['wttr', 'wttr.in', 'specialized', 'Weather information search'],
];

module.exports = { SEARCH_ENGINES };
