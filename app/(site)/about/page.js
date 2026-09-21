import Link from 'next/link';

export const metadata = {
  title: 'About',
  description: 'What SHAM is, who writes it, and how to get in touch.',
};

export default function AboutPage() {
  return (
    <div className="shell">
      <header className="article-head">
        <span className="kicker">About</span>
        <h1>A newsroom the size of a notebook</h1>
        <p className="article-standfirst">
          SHAM publishes reporting and comment on the stories shaping the day, written for people
          who want the whole picture rather than the loudest part of it.
        </p>
      </header>

      <div className="prose" style={{ padding: '34px 0' }}>
        <p>
          Every story here is written and edited in one room. That means fewer pieces than a wire
          service, and more time on each one. Sections run from world affairs and business through
          technology, culture and sport, and each carries its own colour so you can find your way
          around at a glance.
        </p>
        <h2>Reading and joining in</h2>
        <p>
          You never need an account. Like a piece, leave a comment, or pass it on to whoever should
          read it. Comments are moderated by the desk, and the rule is simple: argue with the
          reporting, not with each other.
        </p>
        <h2>Get in touch</h2>
        <p>
          Tips, corrections and complaints are all welcome. Reply to the Friday email, or leave a
          comment on the piece in question and the desk will see it.
        </p>
        <p>
          <Link href="/">Back to the front page</Link>
        </p>
      </div>
    </div>
  );
}
