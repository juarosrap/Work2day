import "../styles/HeroSection.css"

export default function HeroSection() {
    return (
      <>
        <div className="hero-left-section">
          <h2>Do you want a Job?</h2>
          <p>
            hola hola hola asihdauhfañof asdfgas
            <br />
            rgesdgsdafasdfsahgfd sadgargrg
          </p>
          <button className="btn-get">
            Get started <span class="arrow">→</span>
          </button>
          <button className="btn-learn">Learn more</button>
        </div>

        <div className="hero-right-section">
          <form className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label for="name">Name</label>
                <input type="text" id="name" placeholder="Name" />
              </div>

              <div className="form-group">
                <label for="phone">Phone</label>
                <input type="tel" id="phone" placeholder="Phone Number" />
              </div>
            </div>

            <div className="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" placeholder="Email" />
            </div>

            <div className="form-group">
              <label for="message">Message</label>
              <textarea id="message" placeholder="Your Message"></textarea>
            </div>

            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </form>
        </div>
      </>
    );
}