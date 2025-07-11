// src/hooks/useSectionItems.js
import { useState, useEffect } from 'react';
import Url from '../helpers/Url';

export function useSectionItems(slug) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    fetch(`${Url.url}/api/sections/${slug}`)
      .then(r => r.json())
      .then(json => setItems(json.items));
  }, [slug]);
  return { items, setItems };
}
