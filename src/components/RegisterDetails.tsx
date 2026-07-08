"use client";

import { ItemType, sampleImages } from "@/src/lib/types";

export type DetailFields = {
  brand: string;
  name: string;
  size: string;
  price: string;
  memo: string;
};

type Props = {
  type: ItemType;
  fields: DetailFields;
  imagePath: string;
  onFieldChange: (key: keyof DetailFields, value: string) => void;
  onSelectSample: (src: string) => void;
};

export default function RegisterDetails({ type, fields, imagePath, onFieldChange, onSelectSample }: Props) {
  return (
    <div className="register-details">
      <div className="field-grid">
        <label>
          <span>ブランド <em>スキップ可</em></span>
          <input
            value={fields.brand}
            onChange={(event) => onFieldChange("brand", event.target.value)}
            placeholder="Bibiy"
          />
        </label>
        <label>
          <span>商品名 <em>スキップ可</em></span>
          <input
            value={fields.name}
            onChange={(event) => onFieldChange("name", event.target.value)}
            placeholder="lace hoodie"
          />
        </label>
        <label>
          <span>サイズ <em>空欄でOK</em></span>
          <input
            value={fields.size}
            onChange={(event) => onFieldChange("size", event.target.value)}
            placeholder="わかる時だけ"
          />
        </label>
        {type === "purchased" && (
          <label>
            <span>値段 <em>スキップ可</em></span>
            <input
              inputMode="numeric"
              value={fields.price}
              onChange={(event) => onFieldChange("price", event.target.value)}
              placeholder="17800"
            />
          </label>
        )}
        <label className="wide">
          <span>メモ</span>
          <textarea
            value={fields.memo}
            onChange={(event) => onFieldChange("memo", event.target.value)}
            placeholder="発売日、迷っている理由、着たい予定など"
            rows={3}
          />
        </label>
      </div>

      <div className="sample-strip">
        <span>サンプル画像から選ぶ</span>
        <div className="image-choices">
          {sampleImages.map((src) => (
            <button
              aria-label="サンプル画像を選択"
              aria-pressed={src === imagePath}
              className={src === imagePath ? "active" : ""}
              key={src}
              onClick={() => onSelectSample(src)}
              style={{ backgroundImage: `url(${src})` }}
              type="button"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
