# Search Web API - Engine Directory

A comprehensive TypeScript port of SearXNG's search aggregator, supporting 66 search engines across 10 categories.

## Overview

This search API aggregates results from multiple search engines, providing:
- **Multi-engine search**: Query multiple engines simultaneously
- **Result deduplication**: Intelligent merging of duplicate results
- **Weighted ranking**: Position-based scoring with engine and category weights
- **Category-based search**: Search within specific categories (academic, news, images, etc.)
- **Autocomplete**: Query suggestions from 8 search engines

## Supported Search Engines

### Academic

**Arxiv**

arXiv is an open-access repository of electronic preprints and postprints approved for posting after moderation, but not peer reviewed. It consists of scientific papers in the fields of mathematics, physics, astronomy, electrical engineering, computer science, quantitative biology, statistics, mathematical finance, and economics, which can be accessed online. In many fields of mathematics and p...

**Crossref**

Crossref is a nonprofit open digital infrastructure organization for the global scholarly research community. It is the largest digital object identifier (DOI) Registration Agency of the International DOI Foundation. It has 19,000 members from 150 countries representing publishers, libraries, research institutions, and funders and was launched in early 2000 as a cooperative effort among publish...

**Google Scholar**

Google Scholar is a freely accessible web search engine that indexes the full text or metadata of scholarly literature across an array of publishing formats and disciplines. Released in beta in November 2004, the Google Scholar index includes peer-reviewed online academic journals and books, conference papers, theses and dissertations, preprints, abstracts, technical reports, and other scholarl...

**Pubmed**

MEDLINE is a bibliographic database of life sciences and biomedical information. It includes bibliographic information for articles from academic journals covering medicine, nursing, pharmacy, dentistry, veterinary medicine, and health care. MEDLINE also covers much of the literature in biology and biochemistry, as well as fields such as molecular evolution.

**Semantic Scholar**

Semantic Scholar is a research tool for scientific literature. It is developed at the Allen Institute for AI and was publicly released in November 2015. Semantic Scholar uses modern techniques in natural language processing to support the research process, for example by providing automatically generated summaries of scholarly papers. The Semantic Scholar team is actively researching the use of...

**Wikidata**

Wikidata is a collaboratively edited multilingual knowledge graph hosted by the Wikimedia Foundation. It is a common source of open data that Wikimedia projects such as Wikipedia, and anyone else, are able to use under the CC0 public domain license. Wikidata is a wiki powered by the software MediaWiki, including its extension for semi-structured data, the Wikibase. As of early 2025, Wikidata ha...

---

### General Search

**Baidu**

Baidu, Inc. is a Chinese multinational technology company specializing in Internet services and artificial intelligence. It holds a dominant position in China's search engine market, and provides a wide variety of other internet services such as Baidu App, Baidu Baike, iQIYI, and Baidu Tieba.

**Bing**

Microsoft Bing is a search engine owned and operated by Microsoft, it is developed by Microsoft AI. The service traces its roots back to Microsoft's earlier search engines, including MSN Search, Windows Live Search, and Live Search. Bing offers a broad spectrum of search services, encompassing web, video, image, and map search products, all developed using ASP.NET.

**Brave**

Brave is a free and open-source web browser which was first released in 2016. It is developed by US-based Brave Software, Inc. and based on the Chromium web browser. The browser is marketed as a privacy-focused web browser and includes features such as built-in advertisement blocking, protections against browser fingerprinting and a private browsing mode that integrates the Tor anonymity networ...

**Duckduckgo**

currency:en

**Google**

Google Search is a search engine operated by Google. It allows users to search for information on the Web by entering keywords or phrases. Google Search uses algorithms to analyze and rank websites based on their relevance to the search query. Google Search is the most-visited website in the world. As of 2025, Google Search has a 90% share of the global search engine market. Approximately 24.1%...

**Mojeek**

Mojeek is a UK-based search engine known for its focus on privacy and independence from other major search indexes. Established with a commitment to user privacy, Mojeek operates its own crawler-based index, setting it apart from search engines that rely on third-party search results, such as those from Google or Bing.

**Qwant**

Qwant is a French search engine, launched in February 2013. Qwant says that it is focused on privacy, does not track users, resell personal data, or bias the display of search results. Its results are similar to the Microsoft Bing search engine however it is used only in case Qwant lacks information of certain website and for image searches. Qwant is currently only available in around 30 countr...

**Startpage**

Startpage.com is a Dutch search engine website that highlights privacy as its distinguishing feature. The website advertises that it allows users to obtain Bing Search and Google Search results while protecting users' privacy by not storing personal information or search data and removing all trackers. Startpage.com also includes an Anonymous View browsing feature that allows users the option t...

**Yahoo**

The search engine that helps you find exactly what you're looking for. Find the most relevant information, video, images, and answers from all across the Web.

**Yandex**

Yandex LLC is a Russian technology company that provides Internet-related products and services including a web browser, search engine, cloud computing, web mapping, online food ordering, streaming media, online shopping, and a ridesharing company.

---

### Images

**Bing Images**

bing:en

**Deviantart**

DeviantArt is an American online community that features artwork, videography, photography, and literature, launched on August 7, 2000, by Mathew Stephens, Scott Jarkoff and Angelo Sotira, among others.

**Flickr**

Flickr is an image and video hosting service, as well as an online community, founded in Canada and headquartered in the United States. It was created by Ludicorp in 2004 and was for a time a common way for amateur and professional photographers to host high-resolution photos. Flickr was owned by Yahoo! from 2005 and has been owned by SmugMug since 2018.

**Google Images**

Google Images is a search engine owned by Google that allows users to search the World Wide Web for images. It was introduced on July 12, 2001, due to a demand for pictures of the green Versace dress of Jennifer Lopez worn in February 2000. In 2011, image search functionality was added.

**Imgur**

Imgur is an American online image sharing community and image host founded by Alan Schaaf in 2009. The service has hosted viral images and memes, particularly those posted on Reddit.

**Pixabay**

Pixabay.com is a free stock photography and royalty-free stock media website. It is used for sharing photos, illustrations, vector graphics, film footage, stock music and sound effects, exclusively under the custom Pixabay Content License, which generally allows the free use of the material with some restrictions. The site's images are allowed to be used for free without attribution, and allowe...

**Unsplash**

Unsplash is a website dedicated to proprietary stock photography. Since 2021, it has been owned by Getty Images. The website claims over 330,000 contributing photographers and generates more than 13 billion photo impressions per month on their growing library of over 5 million photos. Unsplash has been cited as one of the world's leading photography websites by Forbes, Design Hub, CNET, Medium ...

**Wallhaven**

Your source for the best high quality wallpapers on the Net!

---

### IT & Development

**Crates**

crates.io: Rust Package Registry

**Dockerhub**

hosting service for Docker repository

**Github**

GitHub is a proprietary developer platform that allows developers to create, store, manage, and share their code. It uses Git to provide distributed version control and GitHub itself provides access control, bug tracking, software feature requests, task management, continuous integration, and wikis for every project. GitHub has been a subsidiary of Microsoft since 2018 and its headquarters are ...

**Npm**

npm is a package manager for the JavaScript programming language maintained by npm, Inc., a subsidiary of GitHub. npm is the default package manager for the JavaScript runtime environment Node.js and is included as a recommended feature in the Node.js installer.

**Packagist**

The main Composer repository, aggregating public PHP packages installable with Composer

**Pypi**

The Python Package Index, abbreviated as PyPI and also known as the Cheese Shop, is the official third-party software repository for Python. It is analogous to the CPAN repository for Perl and to the CRAN repository for R. PyPI is run by the Python Software Foundation, a charity. Some package managers, including pip, use PyPI as the default source for packages and their dependencies.

**Rubygems**

RubyGems is a package manager for the Ruby programming language that provides a standard format for distributing Ruby programs and libraries, a tool designed to easily manage the installation of gems, and a server for distributing them. It was created by Chad Fowler, Jim Weirich, David Alan Black, Paul Brannan and Richard Kilmer in 2004.

**Stackoverflow**

Stack Exchange is a network of question-and-answer (Q&A) websites on topics in diverse fields, each site covering a specific topic, where questions, answers, and users are subject to a reputation award process. The reputation system allows the sites to be self-moderating. Currently, Stack Exchange is composed of 173 communities bringing in over 100 million unique visitors each month. As of Febr...

---

### Maps & Location

**Apple Maps**

Apple Maps is a web mapping service developed by Apple. As the default map system of iOS, iPadOS, macOS, tvOS, visionOS, and watchOS, it provides directions and estimated times of arrival for driving, walking, cycling, and public transportation navigation. A \"Flyover\" mode shows certain urban centers and other places of interest in a 3D landscape composed of models of buildings and structures.

**Openstreetmap**

OpenStreetMap (OSM) is a map database maintained by a community of volunteers via open collaboration. Contributors collect data from surveys, trace from aerial photo imagery or satellite imagery, and import from other freely licensed geodata sources. OpenStreetMap is freely licensed under the Open Database License and is commonly used to make electronic maps, inform turn-by-turn navigation, and...

**Photon**

Photon, search-as-you-type with OpenStreetMap

---

### News

**Bing News**

bing:en

**Google News**

Google News is a news aggregator service developed by Google. It presents a continuous flow of links to articles organized from thousands of publishers and magazines.

**Hackernews**

Hacker News (HN) is an American social news website focusing on computer science and entrepreneurship. It is run by the investment fund and startup incubator Y Combinator. In general, content that can be submitted is defined as \"anything that gratifies one's intellectual curiosity.\

**Yahoo News**

Yahoo News is a news website that originated as an internet-based news aggregator by Yahoo.

---

### Social Media

**Mastodon**

*No description available*

**Reddit**

Reddit is an American proprietary social news aggregation and forum social media platform. Registered users submit content to the site such as links, text posts, images, and videos, which are then voted up or down by other members. Posts are organized by subject into user-created boards called \"subreddits\". Submissions with more upvotes appear towards the top of their subreddit and, if they r...

**Soundcloud**

SoundCloud is a German audio streaming service owned and operated by SoundCloud Global Limited & Co. KG. The service allows its users to upload, promote, and share audio. Founded in 2007 by Alexander Ljung and Eric Wahlforss, SoundCloud is one of the largest music streaming services in the world and is available in 190 countries and territories. The service has upwards of 76 million active mont...

---

### Specialized

**Annas Archive**

Anna's Archive is an open source search engine for shadow libraries that was launched by the pseudonymous Anna shortly after law enforcement efforts to shut down Z-Library in 2022. The site aggregates records from Z-Library, Sci-Hub, and Library Genesis (LibGen), among other sources. It calls itself \"the largest truly open library in human history\", and has said it aims to \"catalog all the b...

**Genius**

Genius is an American digital media company founded on August 27, 2009, by Tom Lehman, Ilan Zechory, and Mahbod Moghadam. The company's eponymous website serves as a database for song lyrics, news stories, sources, poetry, and documents, in which users can provide annotations and interpretations for.

**Goodreads**

Goodreads is an American social cataloging website operated by Goodreads, Inc., a subsidiary of Amazon. Users can search its database of books, annotations, quotes, and reviews and expand the database by registering books to generate library catalogs and reading lists. They can also create their own groups of book suggestions, surveys, polls, blogs, and discussions. The website's offices are lo...

**Imdb**

IMDb, historically known as the Internet Movie Database, is an online database of information related to films, television series, podcasts, video games, and streaming content online – including cast, production crew and biographies, plot summaries, trivia, ratings, and fan and critical reviews. As of September 2025, IMDb ranks as the 40th most visited website in the world and the 35th in the U...

**Openlibrary**

Open Library is an online project intended to create \"one web page for every book ever published\". Created by Aaron Swartz, Brewster Kahle, Alexis Rossi, Anand Chitipothu, and Rebecca Hargrave Malamud, Open Library is a project of the Internet Archive, a nonprofit organization. It has been funded in part by grants from the California State Library and the Kahle/Austin Foundation. Open Library...

**Wikipedia**

Wikipedia is a free online encyclopedia written and maintained by a community of volunteers, usually known as Wikipedians, through open collaboration and the wiki software MediaWiki. Founded by Jimmy Wales and Larry Sanger in 2001, Wikipedia has been hosted since 2003 by the Wikimedia Foundation, an American nonprofit organization funded mainly by donations from readers. Wikipedia is the larges...

**Wttr**

weather forecast service

---

### Torrents

**1337X**

1337x is a website that provides a directory of torrent files and magnet links used for peer-to-peer file sharing through the BitTorrent protocol. It is primarily used to facilitate online piracy.

**Kickass**

KickassTorrents was a website that provided a directory for torrent files and magnet links to facilitate peer-to-peer file sharing using the BitTorrent protocol. It was founded in 2008 and by November 2014, KAT became the most visited BitTorrent directory in the world, overtaking The Pirate Bay, according to the site's Alexa ranking. KAT went offline on 20 July 2016 when the domain was seized b...

**Nyaa**

A BitTorrent community focused on Eastern Asian media including anime, manga, music, and more

**Thepiratebay**

The Pirate Bay, commonly abbreviated as TPB, is a free searchable online index of movies, music, video games, pornography and software. Founded in 2003 by Swedish think tank Piratbyrån, The Pirate Bay facilitates the connection among users of the peer-to-peer torrent protocol, which are able to contribute to the site through the addition of magnet links. The Pirate Bay has consistently ranked a...

---

### Videos

**Dailymotion**

Dailymotion is a French online video sharing platform owned by Canal+. Prior to 2024, it was owned by Vivendi. North American launch partners included Vice Media, Bloomberg, and Hearst Digital Media. Dailymotion was among the first platforms to support HD (720p) resolution video. It is available worldwide in 183 languages and 43 localised versions featuring local home pages and content. It has ...

**Peertube**

PeerTube is a free and open-source, decentralized, ActivityPub federated video platform. It can use peer-to-peer technology to reduce load on individual servers when videos get popular.

**Vimeo**

Vimeo is an American video hosting, sharing, and services provider founded in 2004 and headquartered in New York City. Vimeo focuses on the delivery of high-definition video across a range of devices and operates on a software as a service (SaaS) business model. The platform provides tools for video creation, editing, and broadcasting along with enterprise software solutions and the means for v...

**Youtube**

YouTube is an American social media and online video sharing platform owned by Google. YouTube was founded on February 14, 2005, by Chad Hurley, Jawed Karim, and Steve Chen, who were former employees of PayPal. Headquartered in San Bruno, California, it is the second-most-visited website in the world, after Google. In January 2024, YouTube had more than 2.7 billion monthly active users, who col...

---

## Usage

### Basic Search

```bash
# Search across all engines
curl "http://localhost:3000?q=artificial+intelligence"

# Search specific engines
curl "http://localhost:3000?q=machine+learning&engines=google,duckduckgo"

# Search by category
curl "http://localhost:3000?q=quantum+computing&categories=academic"
```

### Autocomplete

```bash
# Get suggestions from Google
curl "http://localhost:3000/autocomplete?q=python&backend=google"

# Multi-backend suggestions
curl "http://localhost:3000/autocomplete/multi?q=javascript&backends=google,duckduckgo,wikipedia"

# List available autocomplete backends
curl "http://localhost:3000/autocomplete/backends"
```

### API Documentation

Visit `http://localhost:3000/docs` for the interactive Scalar API documentation.

## Engine Statistics

- **Total Engines**: 66
- **Categories**: 10
- **Autocomplete Backends**: 8
- **Languages Supported**: Multiple (varies by engine)

## Features

### Search Features
- Multi-engine aggregation
- Result deduplication by URL
- Weighted ranking algorithm
- Category-based filtering
- Engine-specific search
- Pagination support

### Result Types
- Web pages
- Images
- Videos
- News articles
- Academic papers
- Code repositories
- Social media posts
- Maps & locations
- Torrent files

### Ranking Algorithm

Results are scored using SearXNG's proven algorithm:

```
score = Σ (engine_weight × category_weight × occurrences / position)
```

- **Engine weight**: Configurable per-engine multiplier
- **Category weight**: Category importance multiplier
- **Occurrences**: Number of engines that found this result
- **Position**: Result position in original engine results

## Architecture

Based on SearXNG's Python implementation, ported to TypeScript with:
- **Hono**: Fast web framework
- **Bun**: High-performance JavaScript runtime
- **grab-url**: HTTP client for all engine requests
- **linkedom**: HTML/XML parsing

## License

AGPL-3.0-or-later (inherited from SearXNG)

## Credits

- Original SearXNG project: https://github.com/searxng/searxng
- Engine descriptions from SearXNG's engine_descriptions.json
