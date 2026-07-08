"use client";

import {
  countdownFor,
  displayBrand,
  displayName,
  formatDropDate,
  groupWantItems,
  imageOf,
  seasonOf,
} from "@/src/lib/format";
import { Item } from "@/src/lib/types";

type Props = {
  items: Item[];
  onOpenDetail: (item: Item) => void;
  onOpenCalendar: (item: Item) => void;
  onMarkPurchased: (item: Item) => void;
};

export default function WantScreen({ items, onOpenDetail, onOpenCalendar, onMarkPurchased }: Props) {
  const sections = groupWantItems(items);

  return (
    <section className="screen" key="want">
      <header className="screen-header">
        <p>Release Alert</p>
        <h1>買うもの</h1>
        <small>発売が近い順。買えたら「購入品にする」でまとめへ。</small>
      </header>

      <div className="want-sections">
        {sections.map((section, sectionIndex) => (
          <section className="want-section" key={section.key}>
            <h2 className="want-section-title">
              <span>{section.title}</span>
              <em>{section.note}</em>
            </h2>
            <div className="drop-list">
              {section.items.map((item, index) => {
                const dropDate = formatDropDate(item.reminderAt);
                const countdown = countdownFor(item.reminderAt);
                const featured = sectionIndex === 0 && index === 0 && section.key !== "past";
                return (
                  <article className={featured ? "drop-card featured" : "drop-card"} key={item.id}>
                    <button className="drop-main" onClick={() => onOpenDetail(item)} type="button">
                      <div className="drop-image" style={{ backgroundImage: `url(${imageOf(item)})` }}>
                        <span className={`drop-countdown is-${countdown.state}`}>{countdown.label}</span>
                        <span className="drop-date">
                          <small>{dropDate.month}</small>
                          <strong>{dropDate.day}</strong>
                          <small>{dropDate.time}</small>
                        </span>
                      </div>
                      <div className="drop-body">
                        <span className="season-tag">{seasonOf(item)}</span>
                        <strong>{displayBrand(item)}</strong>
                        <span>{displayName(item)}</span>
                        <p>{item.memo || "発売前の気分をここに残す。"}</p>
                      </div>
                    </button>
                    <div className="drop-actions">
                      {section.key === "past" ? (
                        <button className="mark-purchased" onClick={() => onMarkPurchased(item)} type="button">
                          <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" viewBox="0 0 24 24">
                            <path d="m5 12.5 4.5 4.5L19 7.5" />
                          </svg>
                          購入品にする
                        </button>
                      ) : (
                        <button
                          className="calendar-button"
                          disabled={!item.reminderAt}
                          onClick={() => onOpenCalendar(item)}
                          type="button"
                        >
                          <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" viewBox="0 0 24 24">
                            <rect height="15" rx="2.4" width="16.6" x="3.7" y="5" />
                            <path d="M3.7 9.6h16.6M8.2 3v3.4M15.8 3v3.4" />
                          </svg>
                          Googleカレンダー
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
        {items.length === 0 && (
          <div className="empty-state">
            <strong>次に狙う服を登録しましょう</strong>
            <span>発売日や迷っている理由だけでも残せます。</span>
          </div>
        )}
      </div>
    </section>
  );
}
