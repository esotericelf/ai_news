import { Link } from 'react-router-dom';

/**
 * @param {{ label: string, to?: string }[]} items — last item is current page (no link)
 */
export default function Breadcrumbs({ items }) {
  if (!items?.length) return null;

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} aria-current={isLast ? 'page' : undefined}>
              {item.to && !isLast ? <Link to={item.to}>{item.label}</Link> : item.label}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
