import MessageForm from '@/components/MessageForm';

export const metadata = {
  title: 'Message us',
  description:
    'Submit an article for publication, ask a question, or get support from the SHAM desk.',
};

export default function ContactPage() {
  return (
    <div className="shell">
      <header className="article-head">
        <span className="kicker">Message us</span>
        <h1>Get in touch with the desk</h1>
        <p className="article-standfirst">
          Want to submit an article for publication, ask a question, or need support with
          something on the site? Send a message and the newsroom will see it.
        </p>
      </header>

      <div style={{ padding: '34px 0 60px' }}>
        <MessageForm />
      </div>
    </div>
  );
}
