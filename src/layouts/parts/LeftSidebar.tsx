import type { HomeConfig } from "@/libs/types/blog";
import { DEFAULT_PROFILE_ROLE } from "@/libs/site-config";

const DEFAULT_ICON = "●";

const resolveContactHref = (type: string, value: string) => {
  if (!value) return undefined;
  const normalized = type.toLowerCase();
  if (normalized === "email") return `mailto:${value}`;
  if (normalized === "github") return `https://github.com/${value}`;
  if (normalized === "linkedin")
    return value.startsWith("http")
      ? value
      : `https://linkedin.com/in/${value}`;
  return value.startsWith("http") ? value : `https://${value}`;
};

type Props = {
  home: HomeConfig;
};

export const LeftSidebar = ({ home }: Props) => {
  const visibleProjects = home.projects.filter((project) => project.name.trim().length > 0);
  const visibleContacts = home.contacts.filter((contact) => contact.label.trim().length > 0);

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
              const contactHref = resolveContactHref(contact.type, contact.value);
              return (
                <li key={contact.id}>
                  {contactHref ? (
                    <a href={contactHref}>
                      {contact.iconUrl ? (
                        <img src={contact.iconUrl} alt="" />
                      ) : (
                        <span className="contact-icon">{DEFAULT_ICON}</span>
                      )}
                      <span>{contact.label}</span>
                    </a>
                  ) : (
                    <span className="profile-section__item">
                      {contact.iconUrl ? (
                        <img src={contact.iconUrl} alt="" />
                      ) : (
                        <span className="contact-icon">{DEFAULT_ICON}</span>
                      )}
                      <span>{contact.label}</span>
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
