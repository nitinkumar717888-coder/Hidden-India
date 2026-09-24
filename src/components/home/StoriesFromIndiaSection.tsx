import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/common/Container';

interface EditorialStory {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  destinationName: string;
  destinationSlug: string;
  readTime: string;
  date: string;
  imageUrl: string;
  imageAlt: string;
}

const EDITORIAL_STORIES: EditorialStory[] = [
  {
    id: 'story-razia',
    title: 'The Desert Prison of Delhi’s Only Female Monarch',
    subtitle:
      'How Razia Sultana’s fateful 1240 CE frontier campaign ended trapped behind the towering Kushan-era baked brick ramparts of Qila Mubarak in Bathinda.',
    category: 'History & Archaeology',
    destinationName: 'Qila Mubarak, Bathinda',
    destinationSlug: 'qila-mubarak-bathinda',
    readTime: '6 min read',
    date: 'Field Dispatch',
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Monumental brick bastions of Qila Mubarak in Bathinda',
  },
  {
    id: 'story-masrur',
    title: 'The Monolithic Shrines the Himalayas Kept Secret',
    subtitle:
      'Carved directly out of an isolated sandstone ridge in the 8th century, fifteen monolithic rock shikharas face the eternal snows of the Dhauladhars.',
    category: 'Architecture',
    destinationName: 'Masrur Rock-Cut Temples',
    destinationSlug: 'masrur-rock-cut-temples-kangra',
    readTime: '5 min read',
    date: 'Field Dispatch',
    imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Monolithic rock temples reflecting across water pool in Kangra',
  },
  {
    id: 'story-baoli',
    title: 'Subterranean Aquifers of the Shiwalik Foothills',
    subtitle:
      'Tucked deep into the limestone folds of Pinjore, Bassi Baoli continues to draw ice-cold mountain groundwater centuries after its builders vanished.',
    category: 'Lost Places',
    destinationName: 'Bassi Baoli Stepwell',
    destinationSlug: 'bassi-baoli-pinjore',
    readTime: '4 min read',
    date: 'Field Dispatch',
    imageUrl: 'https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Subterranean spring well chambers in Pinjore foothills',
  },
  {
    id: 'story-chehli',
    title: 'Dara Shikoh’s Sufi Tribute Atop a Multi-Millennial Mound',
    subtitle:
      'Rising above the ancient archaeological mound of Harsh Ka Tila, the glowing white marble octagonal mausoleum of Sheikh Chehli stands as a testament to Mughal mystical syncretism.',
    category: 'Culture',
    destinationName: 'Sheikh Chehli’s Tomb',
    destinationSlug: 'sheikh-chehli-tomb-kurukshetra',
    readTime: '5 min read',
    date: 'Field Dispatch',
    imageUrl: 'https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'White marble Persian tomb at Kurukshetra',
  },
];

export const StoriesFromIndiaSection: React.FC = () => {
  const [featuredStory, ...supportingStories] = EDITORIAL_STORIES;

  return (
    <section id="stories" className="stories-section" aria-label="Stories From India">
      <Container size="normal">
        {/* Section Header */}
        <div className="stories-header">
          <div>
            <span className="text-eyebrow">Editorial Dispatches</span>
            <h2 className="text-h1">Stories from India</h2>
            <p className="stories-sub">
              History, places and stories worth taking the long way to discover.
            </p>
          </div>
          <Link
            href="/destinations"
            className="text-small"
            style={{ color: 'var(--color-terracotta)', fontWeight: 600 }}
          >
            Browse all research records &rarr;
          </Link>
        </div>

        {/* Magazine-Style Layout: 1 Featured Dominant Story + 3 Supporting Stories */}
        <div className="stories-magazine-grid">
          {/* Featured Dominant Story */}
          <article className="story-featured-card" aria-label={featuredStory.title}>
            <div className="story-featured-img-wrap">
              <Image
                src={featuredStory.imageUrl}
                alt={featuredStory.imageAlt}
                fill
                sizes="(max-width: 900px) 100vw, 55vw"
                className="story-featured-img"
                loading="lazy"
              />
              <span className="story-featured-category">{featuredStory.category}</span>
            </div>

            <div className="story-featured-body">
              <div className="story-meta-line">
                <span className="story-dest-tag">{featuredStory.destinationName}</span>
                <span className="story-read-time">{featuredStory.readTime}</span>
              </div>

              <h3 className="story-featured-title">
                <Link href={`/destinations/${featuredStory.destinationSlug}`} className="hover-link">
                  {featuredStory.title}
                </Link>
              </h3>

              <p className="story-featured-desc">{featuredStory.subtitle}</p>

              <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <Link
                  href={`/destinations/${featuredStory.destinationSlug}`}
                  className="btn btn-primary btn-sm"
                >
                  Read Field Dispatch &rarr;
                </Link>
              </div>
            </div>
          </article>

          {/* Supporting Stories Column */}
          <div className="supporting-stories-stack">
            {supportingStories.map((story) => (
              <article key={story.id} className="supporting-story-card" aria-label={story.title}>
                <div className="supporting-story-img-wrap">
                  <Image
                    src={story.imageUrl}
                    alt={story.imageAlt}
                    fill
                    sizes="(max-width: 600px) 100vw, 180px"
                    className="supporting-story-img"
                    loading="lazy"
                  />
                </div>

                <div className="supporting-story-body">
                  <div className="story-meta-line">
                    <span className="story-category-tag">{story.category}</span>
                    <span className="story-read-time">{story.readTime}</span>
                  </div>

                  <h4 className="supporting-story-title">
                    <Link href={`/destinations/${story.destinationSlug}`} className="hover-link">
                      {story.title}
                    </Link>
                  </h4>

                  <p className="supporting-story-desc">{story.subtitle}</p>

                  <Link
                    href={`/destinations/${story.destinationSlug}`}
                    className="supporting-cta"
                  >
                    <span>Inspect place</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};
