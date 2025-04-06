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
          <div className="form-group">
            <label for="name">Name</label> <br />
            <input type="text" id="name" placeholder="Name" />
          </div>

          <div className="form-group">
            <label for="phone">Phone</label> <br />
            <input type="tel" id="phone" placeholder="Phone Number" />
          </div>

          <div className="form-group">
            <label for="email">Email</label> <br />
            <input type="email" id="email" placeholder="Email" />
          </div>

          <div className="form-group">
            <label for="message">Message</label>
            <br />
            <textarea id="message" placeholder="Your Message"></textarea>
          </div>
          <div className="form-group">
            <button type="submit" className="btn-submit">
              Submit
            </button>
          </div>
        </div>
      </>
    );
}