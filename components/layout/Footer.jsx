import Container from './Container';

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <Container className="py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} Velocity. All rights reserved.
          </p>

          <nav className="flex gap-4 text-sm">
            <a href="/privacy" className="hover:text-blue-600">
              Privacy
            </a>
            <a href="/terms" className="hover:text-blue-600">
              Terms
            </a>
            <a href="/contact" className="hover:text-blue-600">
              Contact
            </a>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
