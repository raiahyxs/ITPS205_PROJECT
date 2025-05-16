import { useDarkMode } from "../../ColorThemeContext"; // Keep if you plan to use dark mode later

function SuggestCards() {
  // Although useDarkMode is imported, the darkMode variable isn't used in this Tailwind version yet.
  // You would add 'dark:' prefixed classes if you implement theme switching.
  // const { darkMode } = useDarkMode();

  return (
    // --- Main Container ---
    // - Replaced fixed vh height with padding (py-8) for content-based height.
    // - Replaced vw width/padding with max-width (max-w-6xl), centering (mx-auto), and responsive padding (px-4 sm:px-6 lg:px-8).
    // - Replaced vh margin-top with Tailwind spacing (mt-16).
    // - Applied background, blur, shadow, and rounded corners using Tailwind classes.
    // - Uses flex column layout with gap for spacing between title and cards.
    <div className="
        w-full max-w-6xl mx-auto mt-16 py-8 px-4 sm:px-6 lg:px-8
        bg-cyan-100/30 dark:bg-gray-800/30           backdrop-blur-md
        shadow-lg dark:shadow-[0_4px_10px_rgba(0,0,0,0.4)]       rounded-2xl
        flex flex-col gap-y-6
      "
    >
      {/* --- Title --- */}
      {/* - Applied text size, weight, and color. Added responsive text size. */}
      <p className="
          text-xl md:text-2xl font-semibold text-cyan-800 dark:text-cyan-200
        "
      >
        Recommendations
      </p>

      {/* --- Cards Container --- */}
      {/* - Used CSS Grid for responsive columns: 1 col on mobile, 2 on sm+, 3 on lg+.
          - Added gap for spacing between grid items (cards). */}
      <div className="
          grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6
        "
      >
        {/* --- Suggestion Card 1 --- */}
        {/* - Basic card styling: background, padding, rounded corners, shadow.
            - Added min-height (h-40) for consistency.
            - Centered content vertically and horizontally within the card. */}
        <div className="
            bg-white dark:bg-gray-700 rounded-lg shadow-md p-4
            flex items-center justify-center h-40
            hover:shadow-lg transition-shadow duration-200
          "
        >
          {/* Card Content */}
          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Card 1 Text</h2>
        </div>

        {/* --- Suggestion Card 2 --- */}
        <div className="
            bg-white dark:bg-gray-700 rounded-lg shadow-md p-4
            flex items-center justify-center h-40
            hover:shadow-lg transition-shadow duration-200
          "
        >
          {/* Card Content */}
          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Card 2 Text</h2>
        </div>

        {/* --- Suggestion Card 3 --- */}
        <div className="
            bg-white dark:bg-gray-700 rounded-lg shadow-md p-4
            flex items-center justify-center h-40
            hover:shadow-lg transition-shadow duration-200
          "
        >
          {/* Card Content */}
          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Card 3 Text</h2>
        </div>

        {/* Add more cards here if needed, they will follow the grid layout */}

      </div>
    </div>
  );
}

export default SuggestCards;