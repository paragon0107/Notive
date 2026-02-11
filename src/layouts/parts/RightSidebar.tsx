import type { HomeConfig } from "@/libs/types/blog";
import { DEFAULT_PROFILE_ROLE } from "@/libs/site-config";

const DEFAULT_ICON = "●";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d()\-\s]{7,}$/;
const DOMAIN_PATTERN = /^[^\s]+\.[^\s]{2,}(\/.*)?$/;

const normalizePhoneForTel = (value: string) => {
  const hasPlusPrefix = value.trim().startsWith("+");
  const digits = value.replace(/\D/g, "");
  if (!digits) return undefined;
  return hasPlusPrefix ? `+${digits}` : digits;
};

const resolveContactHref = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (/^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) return trimmed;
  if (EMAIL_PATTERN.test(trimmed)) return `mailto:${trimmed}`;

  if (PHONE_PATTERN.test(trimmed)) {
    const normalizedPhone = normalizePhoneForTel(trimmed);
    return normalizedPhone ? `tel:${normalizedPhone}` : undefined;
  }

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^www\./i.test(trimmed) || DOMAIN_PATTERN.test(trimmed)) return `https://${trimmed}`;
  return undefined;
};

type Props = {
  home: HomeConfig;
};

export const RightSidebar = ({ home }: Props) => {
  const visibleProjects = home.projects.filter((project) => project.name.trim().length > 0);
  const visibleContacts = home.contacts.filter((contact) => contact.name.trim().length > 0);

  return (
    <div className="sidebar-profile">
      <div className="profile">
        {home.profileImageUrl ? (
          <img
            src={home.profileImageUrl}
            alt={home.profileName ?? "profile"}
            className="profile__image"
          />
        ) : (
          <div className="profile__image profile__placeholder" />
        )}
        <div className="profile__name">{home.profileName ?? home.blogName}</div>
        <div className="profile__role">
          {home.aboutMe || DEFAULT_PROFILE_ROLE}
        </div>
      </div>

      {visibleProjects.length > 0 ? (
        <section className="profile-section">
          <h3>Projects</h3>
          <ul>
            {visibleProjects.map((project) => (
              <li key={project.id}>
                {project.link ? (
                  <a href={project.link} target="_blank" rel="noopener noreferrer">
                    <span className="project-icon">
                      {project.iconUrl ? (
                        <img src={project.iconUrl} alt="" />
                      ) : (
                        DEFAULT_ICON
                      )}
                    </span>
                    {project.name}
                  </a>
                ) : (
                  <span className="profile-section__item">
                    <span className="project-icon">
                      {project.iconUrl ? (
                        <img src={project.iconUrl} alt="" />
                      ) : (
                        DEFAULT_ICON
                      )}
                    </span>
                    {project.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {visibleContacts.length > 0 ? (
        <section className="profile-section">
          <h3>Contact</h3>
          <ul className="contact-list">
            {visibleContacts.map((contact) => {
              const contactHref = resolveContactHref(contact.value);
              const isExternalLink = Boolean(contactHref?.startsWith("http"));
              return (
                <li key={contact.id}>
                  {contactHref ? (
                    <a
                      href={contactHref}
                      target={isExternalLink ? "_blank" : undefined}
                      rel={isExternalLink ? "noopener noreferrer" : undefined}
                    >
                      {contact.iconUrl ? (
                        <img src={contact.iconUrl} alt="" />
                      ) : (
                        <span className="contact-icon">{DEFAULT_ICON}</span>
                      )}
                      <span>{contact.name}</span>
                    </a>
                  ) : (
                    <span className="profile-section__item">
                      {contact.iconUrl ? (
                        <img src={contact.iconUrl} alt="" />
                      ) : (
                        <span className="contact-icon">{DEFAULT_ICON}</span>
                      )}
                      <span>{contact.name}</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
};
